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
                                slot1: null,
                                slot2: null,
                                slot3: null,
                                slot4: null,
                                slot5: null,
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
                                    '/scripts/built-in/sprite-sheet.js',
                                ]
                            },
                            shadow: {}
                        }
                    };

                return assembly;
            };
        }
    ]);
