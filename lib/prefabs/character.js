angular
    .module('prefabs.character', [])
    .factory('CharacterPrefab', [
        function() {
            'use strict';

            return function(entityData) {
                var customs = entityData.userData || {},
                    assembly = {
                        components: {
                            armor: {
                                max: customs.health || 0,
                                value: customs.health || 0
                            },
                            speed: {},
                            health: {
                                max: customs.health || 10,
                                value: customs.health || 10
                            },
                            quad: {
                                transparent: true,
                                charBuildData: {
                                    skin: customs.skin,
                                    eyes: customs.eyes,
                                    hair: customs.hair
                                }
                            },
                            rigidBody: {
                                shape: {
                                    type: 'capsule',
                                    width: 0.5,
                                    height: 1.0,
                                    depth: 0.5,
                                    radius: 0.5

                                    // type: 'sphere',
                                    // radius: 0.5
                                },
                                mass: 1,
                                friction: 0.0,
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
