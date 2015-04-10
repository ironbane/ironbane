angular
    .module('prefabs.character', [])
    .factory('CharacterPrefab', [
        function() {
            'use strict';

            return function(entityData) {
                var customs = entityData.userData || {},
                    assembly = {
                        owner: customs.ownerId,
                        name: customs.charName,
                        position: customs.position,
                        rotation: customs.rotation,
                        level: customs.zone,
                        components: {
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
