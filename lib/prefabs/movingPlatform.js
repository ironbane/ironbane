angular
    .module('prefabs.movingPlatform', [])
    .factory('MovingPlatformPrefab', [
        function() {
            'use strict';

            return function(entityData) {
                var customs = entityData.userData || {},
                    assembly = {
                        components: {
                            mover: {
                                pos: [0, 5, 0],
                                speed: 0.8
                            },
                            rigidBody: {
                                shape: {
                                    type: 'box',
                                    width: 1.5,
                                    height: 0.25,
                                    depth: 1.5
                                },
                                mass: 0
                            }
                        }
                    };

                return assembly;
            };
        }
    ]);
