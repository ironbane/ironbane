angular
    .module('prefabs.mediumFire', [])
    .factory('MediumFirePrefab', [
        function() {
            'use strict';

            return function(entityData) {
                var customs = entityData.userData || {},
                    assembly = {
                        components: {
                            particleEmitter: {
                                group: {
                                    texture: 'images/particles/small.png',
                                    hasPerspective: true,
                                    colorize: true
                                },
                                emitter: {
                                    type: 'cube',
                                    acceleration: [0, 0, 0],
                                    accelerationSpread: [0.15, 0.25, 0.15],
                                    positionSpread: [0.5, 0, 0.5],
                                    velocity: [0, 0.1, 0],
                                    velocitySpread: [0, 0, 0],
                                    particlesPerSecond: 10,
                                    sizeStart: 1,
                                    sizeEnd: 0.1,
                                    opacityStart: 1,
                                    opacityEnd: 0,
                                    colorStart: '#ff4800',
                                    particleCount: 500
                                }
                            }
                        }
                    };

                return assembly;
            };
        }
    ]);
