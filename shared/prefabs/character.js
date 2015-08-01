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
                                slot0: {name: 'Wooden Shield', type: 'shield', image: 1138, armor: 1},
                                slot1: {name: 'Coin Sack', type: 'cash', image: 1029, qty: 2},
                                slot2: {name: 'Rusty Kitchen Knife', type: 'weapon', handedness: '1', image: 1551, damage: 1},
                                slot3: {name: 'Dirty Dishcloth Bandana', type: 'head', image: 1, invImage: 426, armor: 0},
                                slot4: {name: 'Old Shoes', type: 'feet', image: 164, armor: 1},
                                slot5: {name: 'Peasant Shirt', type: 'body', image: 56, armor: 1},
                                slot6: {name: 'Ring of Elemental Power', type: 'relic', image: 1033}, // TODO: properties for powers
                                slot7: {name: 'Ritual Dagger', type: 'weapon', handedness: '1', image: 1583, damage: 4}
                            },
                            health: {
                                max: customs.health || 6,
                                value: customs.health || 6
                            },
                            armorRegen: {}, // we don't start with armor, but when we do it self repairs
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
