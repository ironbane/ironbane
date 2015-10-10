angular
    .module('services.contentLoader', [
        'global.constants',
        'engine.util'
    ])
    .service('ContentLoader', ["IB_CONSTANTS", "$q", "IbUtils", function(IB_CONSTANTS, $q, IbUtils) {
        'use strict';

        var parse = Meteor.npmRequire('csv-parse');
        var request = Meteor.npmRequire('request');

        var itemList = [];
        var npcPrefabs = {};

        var rawItems = null;
        var rawNpcs = null;

        var itemHeaders = null;
        var npcHeaders = null;

        var getValue = function(row, headers, header) {
            return row[headers.indexOf(header)];
        };

        var loadContent = function(filename) {
            var deferred = $q.defer();

            var load = function(text) {
                var parser = parse(text, {
                    delimiter: ',',
                    auto_parse: true
                }, function(err, data) {
                    if (err) {
                        deferred.reject(err);
                    }

                    deferred.resolve(data);
                });

                return parser;
            };

            // assume if there's an http protocol that we're using remote files,
            // otherwise in the privates
            if (filename.search(/http/) >= 0) {
                request(filename, function(error, response, body) {
                    var statusCode = response.statusCode;
                    if (!error && statusCode === 200) {
                        load(body);
                    } else {
                        deferred.reject({error, statusCode});
                    }
                });
            } else {
                Assets.getText(filename, function(err, text) {
                    if (err) {
                        return deferred.reject(err);
                    }

                    load(text);
                });
            }

            return deferred.promise;
        };

        this.buildInventory = function(inventoryItemNames, equipmentItemNames, gold) {
            gold = gold || 0;
            inventoryItemNames = inventoryItemNames || [];
            equipmentItemNames = equipmentItemNames || [];

            var inventory = {
                gold: gold
            };
            var slotCount = 0;
            var handSlotCount = 0;
            var relicCount = 1; // Relics apparently start count from 1 while slots start from 0 :P

            var addItemToInventory = function(addToEquipment) {
                return function(itemName) {
                    itemName = itemName.trim();

                    var lootDropChance = 0.0;

                    var itemNameParts = itemName.split(' ');
                    var lastPart = itemNameParts[itemNameParts.length - 1];
                    if (lastPart.substring(lastPart.length - 1) === '%') {
                        lootDropChance = parseFloat(lastPart.substring(0, lastPart.length - 1));
                        itemNameParts.pop();
                        itemName = itemNameParts.join(' ');
                    }

                    if (!addToEquipment) {
                        // We'll filter here, so if they managed to go through
                        // set the lootDropChance to 100

                        var roll = IbUtils.getRandomFloat(0, 100);

                        // console.log(itemName, 'lootDropChance', lootDropChance, 'roll', roll);
                        if (roll > lootDropChance) {
                            // console.log('not adding');
                            return;
                        }
                        else {
                            // console.log('adding');
                        }

                        lootDropChance = 100.0;
                    }
                    else {
                        // In the case of equipment, loopDropChance will be 0.0
                        // unless they explicitly set something different in the sheet
                    }

                    // console.log('lootDropChance', lootDropChance, itemName);

                    rawItems.forEach(function(item) {
                        var name = getValue(item, itemHeaders, 'Name');

                        if (name === itemName) {
                            var type = getValue(item, itemHeaders, 'Type');

                            var slot = null;

                            if (addToEquipment) {
                                if ((type === 'weapon' || type === 'shield') && handSlotCount <= 1) {
                                    if (handSlotCount === 0) {
                                        slot = 'rhand';
                                    } else if (handSlotCount === 1) {
                                        slot = 'lhand';
                                    }
                                    handSlotCount++;
                                } else if (type === 'relic' && relicCount <= 4) {
                                    slot = 'relic' + relicCount;
                                    relicCount++;
                                } else if (type === 'body' && !inventory['body']) {
                                    slot = 'body';
                                } else if (type === 'feet' && !inventory['feet']) {
                                    slot = 'feet';
                                } else if (type === 'head' && !inventory['head']) {
                                    slot = 'head';
                                }
                            } else {
                                if (slotCount <= 7) {
                                    slot = 'slot' + slotCount;
                                    slotCount++;
                                }
                            }

                            if (slot) {
                                inventory[slot] = {
                                    name: name,
                                    type: type,
                                    uuid: IbUtils.generateUuid()
                                };

                                var mapping = {
                                    name: 'Name',
                                    type: 'Type',
                                    image: 'Image',
                                    invImage: 'Inventory Image',
                                    damage: 'Damage',
                                    armor: 'Armor',
                                    rarity: 'Rarity',
                                    range: 'Range',
                                    projectileSpeed: 'Projectile Speed',
                                    attackCooldown: 'Attack Cooldown',
                                    handedness: 'Handedness',
                                    price: 'Buy Price',
                                    dropChance: 'Drop Chance %',
                                    displayNotes: 'Display Notes',
                                    devNotes: 'Special Powers & Notes',
                                    behavior: 'Behavior'
                                };

                                for (var key in mapping) {
                                    let value = getValue(item, itemHeaders, mapping[key]);

                                    if (angular.isString(value)) {
                                        value = value.trim();
                                    }

                                    if (key === 'behavior') {
                                        value = value && value.split(',');
                                        if (value && value.length > 0) {
                                            value = value.map(v => v.trim());
                                        }
                                    }

                                    if (value || value === 0) {
                                        inventory[slot][key] = value;
                                    }
                                }

                                inventory[slot].dropChance = lootDropChance;
                            }

                        }
                    });
                };
            };

            equipmentItemNames.forEach(addItemToInventory(true));
            inventoryItemNames.forEach(addItemToInventory(false));

            return inventory;
        };

        this.buildNPCPrefabs = function() {
            rawNpcs.forEach(function(npc) {

                // For now only set the names
                // We'll build the inventory when fetching the prefab to ensure unique uuid's
                var inventoryItemNames = getValue(npc, npcHeaders, 'inventory').split(',');
                var equipmentItemNames = getValue(npc, npcHeaders, 'equipment').split(',');

                var monsterBehaviour = getValue(npc, npcHeaders, 'behaviour').split(',');
                monsterBehaviour = monsterBehaviour.map(function(p) {
                    return p.trim();
                });
                var monsterBehaviourHash = {};
                _.each(monsterBehaviour, function(p) {
                    if (p) {
                        monsterBehaviourHash[p] = true;
                    }
                });

                var charBuildData = getValue(npc, npcHeaders, 'imageData');

                // Build a list of NPCS with all their components
                var npcPrefab = {
                    gold: getValue(npc, npcHeaders, 'gold'),
                    inventoryItemNames: inventoryItemNames,
                    equipmentItemNames: equipmentItemNames,
                    components: {
                        quad: {
                            transparent: true,
                            width: getValue(npc, npcHeaders, 'size'),
                            height: getValue(npc, npcHeaders, 'size'),
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
                            prefix: getValue(npc, npcHeaders, 'prefix'),
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
                        armorRegen: {},
                        damageable: {},
                        globalState: {
                            state: getValue(npc, npcHeaders, 'scriptType'),
                            config: {
                                aggroRadius: 15,
                                defendRadius: 30,
                                monsterBehaviour: monsterBehaviourHash
                            }
                        },
                        steeringBehaviour: {
                            speed: monsterBehaviourHash['Fast Movement'] ? 3 : 2,
                            maxSpeed: 5
                        }
                    }
                };

                var name = getValue(npc, npcHeaders, 'name');

                npcPrefabs[name] = npcPrefab;
            });
        };

        this.load = function() {
            var me = this;

            // TODO: rely on a better config file than hard coding these...
            var defaultProdFiles = [
                    'npcs.csv',
                    'items.csv'
                ],
                defaultDevFiles = [
                    'https://docs.google.com/spreadsheets/d/1a_dtZT1dUZnA3DlFTWbGKBCUZIAhuy2NQ6Hj8wtZJdU/pub?output=csv', // npcs
                    'https://docs.google.com/spreadsheets/d/1ZC-ydW7if6Ci0TytsSLaio0LMoCntQwaUkXAOwjn7Y8/pub?output=csv' // items
                ],
                filesToLoad = IB_CONSTANTS.isDev ? defaultDevFiles : defaultProdFiles;

            // allow override via commandline or env variable
            if (Meteor.settings.content) {
                filesToLoad = [
                    Meteor.settings.content.npcs,
                    Meteor.settings.content.items
                ];
            }

            return $q.all(filesToLoad.map(function(file) {
                return loadContent(file);
            })).then(function(result) {
                var npcs = result[0],
                    items = result[1];

                rawItems = items;
                rawNpcs = npcs;

                itemHeaders = rawItems.shift();
                npcHeaders = rawNpcs.shift();

                me.buildNPCPrefabs();

                console.log('Loaded ' + rawItems.length + ' items');
                console.log('Loaded ' + rawNpcs.length + ' NPC prefabs');
            });
        };

        this.hasNPCPrefab = function(prefabName) {
            return npcPrefabs[prefabName];
        };

        this.getNPCPrefab = function(prefabName) {
            var prefab = JSON.parse(JSON.stringify(npcPrefabs[prefabName]));

            if (prefab.components.quad.charBuildData.special === 'villager') {


                var hairList = _.filter(IB_CONSTANTS.charImages.hair, function(img) {
                    return img >= 1000 && img <= 1015;
                });
                var eyesList = _.filter(IB_CONSTANTS.charImages.eyes, function(img) {
                    return img >= 1000 && img <= 1015;
                });
                var skinList = _.filter(IB_CONSTANTS.charImages.skin, function(img) {
                    return img >= 1000 && img <= 1015;
                });

                prefab.components.quad.charBuildData = {
                    body: _.sample([1, 10, 102, 12, 16, 19, 2, 23, 3, 4, 81, 82, 83, 95, 97, 99]),
                    feet: _.sample(IB_CONSTANTS.charImages.feet),
                    head: _.sample([0, 0, 0, 0, 0, 0, 0, 1, 2, 4, 5, 6, 7, 8]),
                    hair: _.sample(hairList),
                    eyes: _.sample(eyesList),
                    skin: _.sample(skinList)
                };

                // console.log(prefab.components.quad.charBuildData);

                delete prefab.components.inventory;

                prefab.components.steeringBehaviour.speed = IbUtils.getRandomInt(1, 2);
                prefab.components.steeringBehaviour.maxSpeed = IbUtils.getRandomInt(1, 2);

                // prefab.itemNames = [];

                // for (var i = 0; i < IbUtils.getRandomInt(0, 7); i++) {
                //     var rawItem = _.sample(rawItems);
                //     var name = getValue(rawItem, itemHeaders, 'Name');

                //     prefab.itemNames.push(name);
                // }
            }

            prefab.components.inventory = this.buildInventory(prefab.inventoryItemNames, prefab.equipmentItemNames, prefab.gold);

            delete prefab.inventoryItemNames;
            delete prefab.equipmentItemNames;

            return prefab;
        };

    }]);
