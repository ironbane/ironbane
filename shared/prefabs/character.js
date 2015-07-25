angular
    .module('prefabs.character', [])
    .factory('CharacterPrefab', [
        function() {
            'use strict';

            return function(entityData) {
                var customs = entityData.userData || {},
                    assembly = {
                        components: {
                            speed: {},
                            inventory: {
                                // we define these again for hasOwnProperty, a chest would not have the equipment
                                head: null,
                                body: null,
                                feet: null,
                                rhand: null,
                                lhand: null,
                                relic1: null,
                                relic2: null,
                                relic3: null,
                                // testing...
                                slot1: {name: 'Coin Sack', type: 'cash', image: 4, invImage: 4, qty: 831},
                                slot2: {name: 'Dull Sword', type: 'weapon', image: 14, invImage: 14, damage: 1},
                                slot3: {name: 'Wooden Helmet', type: 'head', image: 1, invImage: 'wooden_helmet', armor: 1},
                                slot4: {name: 'Wooden Boots', type: 'feet', image: 1, invImage: 'wooden_boots', armor: 1},
                                slot5: {name: 'Wooden Armor', type: 'body', image: 1, invImage: 'wooden_armor', armor: 1},
                                slot6: null,
                                slot7: null
                            },
                            health: {
                                max: customs.health || 6,
                                value: customs.health || 6
                            },
                            quad: {
                                transparent: true,
                                charBuildData: {
                                    skin: customs.skin,
                                    eyes: customs.eyes,
                                    hair: customs.hair
                                }
                            },
                            'name-mesh': {
                                text: customs.charName
                            },
                            script: {
                                scripts: [
                                    '/scripts/built-in/walk-animation.js',
                                ]
                            },
                            shadow: {}
                        }
                    };

                return assembly;
            };
        }
    ]);
