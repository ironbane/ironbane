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
                                    texture: 'images/particles/splash1.png'
                                },
                                emitter: {
                                    type: 'cube',
                                    acceleration: [0, -2, 0],
                                    accelerationSpread: [5, 0, 5],
                                    velocity: [0, -2, 0],
                                    velocitySpread: [5, -2.75, 5],
                                    particlesPerSecond: 300,
                                    sizeStart: 0.25,
                                    sizeEnd: 0.25,
                                    opacityStart: 1,
                                    opacityEnd: 1,
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
