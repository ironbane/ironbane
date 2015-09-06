angular
    .module('services.contentLoader', [
        'global.constants'
    ])
    .service('ContentLoader', function (IB_CONSTANTS, $q) {

        var fs = Meteor.npmRequire('fs');
        var parse = Meteor.npmRequire('csv-parse');
        var request = Meteor.npmRequire('request');

        var itemList = [];
        var npcPrefabs = {};

        var rawItems = null;
        var rawNpcs = null;

        var itemHeaders = null;
        var npcHeaders = null;

        var getValue = function (row, headers, header) {
            return row[headers.indexOf(header)];
        };

        var generateID = function() {
            var str = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx';

            str = str.replace(/[xy]/g, function(c) {
                var rand = Math.random();
                var r = rand * 16 | 0 % 16,
                    v = c === 'x' ? r : (r & 0x3 | 0x8);

                return v.toString(16);
            });

            return str;
        };

        var loadContent = function (remoteUrl, assetsName) {
            var deferred = $q.defer();

            var load = function (text) {
                var parser = parse(text, {delimiter: ',', auto_parse: true}, function(err, data){
                    if (err) {
                        deferred.reject(err);
                    }

                    deferred.resolve(data);
                });
            };

            if (IB_CONSTANTS.isDev) {
                request(remoteUrl, function (error, response, body) {
                    if (!error && response.statusCode == 200) {
                        load(body);
                    }
                    else {
                        deferred.reject(error);
                    }
                });
            }
            else {
                // On production we load a static file so we're in control of the changes each release
                Assets.getText(assetsName, function (text) {
                    load(text);
                });
            }

            return deferred.promise;
        };

        this.buildInventory = function (carriedItemNames) {

            var inventory = {};
            var slotCount = 0;
            var handSlotCount = 0;
            var relicCount = 1; // Relics apparently start count from 1 while slots start from 0 :P
            carriedItemNames.forEach(function (itemName) {
                itemName = itemName.trim();
                rawItems.forEach(function (item) {
                    var name = getValue(item, itemHeaders, 'Name');
                    if (name === itemName) {
                        var type = getValue(item, itemHeaders, 'Type');

                        var slot = null;

                        // TODO what about monsters that have a dashing attack but still want to have
                        // melee weapons in their inventory? Perhaps bosses?

                        if ((type === 'weapon' || type === 'shield') && handSlotCount <= 1) {
                            if (handSlotCount === 0) {
                                slot = 'rhand';
                            }
                            else if (handSlotCount === 1) {
                                slot = 'lhand';
                            }
                            handSlotCount++;
                        }
                        else if (type === 'relic' && relicCount <= 4) {
                            slot = 'relic' + relicCount;
                            relicCount++;
                        }
                        else if (type === 'body' && !inventory['body']) {
                            slot = 'body';
                        }
                        else if (type === 'feet' && !inventory['feet']) {
                            slot = 'feet';
                        }
                        else if (type === 'head' && !inventory['head']) {
                            slot = 'head';
                        }
                        else if (slotCount <= 7) {
                            slot = 'slot' + slotCount;
                            slotCount++;
                        }

                        if (slot) {
                            inventory[slot] = {
                                name: name,
                                type: type,
                                uuid: generateID()
                            };

                            var mapping = {
                                image: 'Image',
                                invImage: 'Inventory Image',
                                damage: 'Damage',
                                armor: 'Armor',
                                range: 'Range',
                                projectileSpeed: 'Projectile Speed',
                                attackCooldown: 'Attack Cooldown',
                                handedness: 'Handedness',
                                price: 'Buy Price'
                            };

                            _.each(mapping, function (val, key) {
                                var mappedValue = getValue(item, itemHeaders, val);
                                if (mappedValue) {
                                    inventory[slot][key] = mappedValue;
                                }
                            });
                        }

                    }
                });
            });

            return inventory;
        };

        this.buildNPCPrefabs = function () {
            var me = this;

            rawNpcs.forEach(function (npc) {

                // First build an inventory
                var carriedItemNames = getValue(npc, npcHeaders, 'inventory').split(',');
                var inventory = me.buildInventory(carriedItemNames);

                var charBuildData = getValue(npc, npcHeaders, 'imageData');

                // Build a list of NPCS with all their components
                var npcPrefab = {
                    components: {
                        quad: {
                            transparent: true,
                            charBuildData: charBuildData ? JSON.parse(charBuildData) : {}
                        },
                        rigidBody: {
                            shape: {
                                type: 'sphere',
                                // height: 1,
                                radius: getValue(npc, npcHeaders, 'size') * 0.5
                            },
                            mass: 1,
                            friction: 0,
                            restitution: 0,
                            allowSleep: false,
                            lock: {
                                position: {
                                    x: false,
                                    y: false,
                                    z: false
                                },
                                rotation: {
                                    x: true,
                                    y: true,
                                    z: true
                                }
                            },
                            group: 'npcs',
                            collidesWith: ['level', 'npcs', 'otherPlayers']
                        },
                        script: {
                            scripts: [
                                '/scripts/built-in/walk-animation.js',
                            ]
                        },
                        fighter: {
                            faction: getValue(npc, npcHeaders, 'faction')
                        },
                        shadow: {
                            simple: true
                        },
                        health: {
                            max: getValue(npc, npcHeaders, 'health'),
                            value: getValue(npc, npcHeaders, 'health')
                        },
                        armor: {
                            max: getValue(npc, npcHeaders, 'armor'),
                            value: getValue(npc, npcHeaders, 'armor')
                        },
                        inventory: inventory,
                        damageable: {},
                        globalState: {
                            state: getValue(npc, npcHeaders, 'scriptType')
                        },
                        steeringBehaviour: {}
                    }
                };

                var name = getValue(npc, npcHeaders, 'name');

                npcPrefabs[name] = npcPrefab;
            });
        };

        this.load = function () {

            var me = this;

            return loadContent('https://docs.google.com/spreadsheets/d/1a_dtZT1dUZnA3DlFTWbGKBCUZIAhuy2NQ6Hj8wtZJdU/pub?output=csv', 'npcs.csv').then(function (npcs) {
                return loadContent('https://docs.google.com/spreadsheets/d/1ZC-ydW7if6Ci0TytsSLaio0LMoCntQwaUkXAOwjn7Y8/pub?output=csv', 'items.csv').then(function (items) {

                    rawItems = items;
                    rawNpcs = npcs;

                    itemHeaders = rawItems.shift();
                    npcHeaders = rawNpcs.shift();

                    me.buildNPCPrefabs();

                    console.log('Loaded ' + rawItems.length + ' items');
                    console.log('Loaded ' + rawNpcs.length + ' NPC prefabs');

                });
            });

        };

        this.getNPCPrefab = function (prefabName) {
            return npcPrefabs[prefabName];
        };

    })