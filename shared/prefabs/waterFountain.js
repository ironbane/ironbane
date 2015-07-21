angular
    .module('prefabs.waterFountain', [])
    .factory('WaterFountainPrefab', [
        function() {
            'use strict';

            return function(entityData) {
                var customs = entityData.userData || {},
                    assembly = {
                        components: {
                            particleEmitter: {
                                group: {
                                    texture: 'images/particles/small.png'
                                },
                                emitter: {
                                    type: 'cube',
                                    acceleration: [0, -1, 0],
                                    accelerationSpread: [3, 0, 3],
                                    velocity: [0, -1, 0],
                                    velocitySpread: [3, -1.75, 3],
                                    particlesPerSecond: 300,
                                    sizeStart: 0.1,
                                    sizeEnd: 0.1,
                                    opacityStart: 1,
                                    opacityEnd: 0.5,
                                    colorStart: 'blue',
                                    colorEnd: 'white',
                                    particleCount: 2000
                                }
                            }
                        }
                    };

                return assembly;
            };
        }
    ]);
