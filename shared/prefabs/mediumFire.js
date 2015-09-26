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
                                    velocity: [0, 0.5, 0],
                                    velocitySpread: [0, 0, 0],
                                    particlesPerSecond: 10,
                                    sizeStart: 1,
                                    sizeEnd: 0.1,
                                    opacityStart: 1,
                                    opacityEnd: 0,
                                    colorStart: '#ff4800',
                                    particleCount: 50
                                }
                            },
                            light: {
                                type: 'PointLight',
                                color: 0xff8442,
                                distance: 10.5,
                                intensity: 2,
                                flicker: true
                            }
                        }
                    };

                return assembly;
            };
        }
    ]);
