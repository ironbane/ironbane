angular
    .module('prefabs.movingPlatform', [])
    .factory('MovingPlatformPrefab', [
        function() {
            'use strict';

            return function(entityData) {
                var customs = entityData.userData || {},
                    assembly = {
                        components: {
                            rigidBody: {
                                shape: {
                                    type: 'box',
                                    width: 1.5,
                                    height: 0.25,
                                    depth: 1.5
                                }
                            },
                            netSend: {},
                            netRecv: {}
                        }
                    };

                return assembly;
            };
        }
    ]);
