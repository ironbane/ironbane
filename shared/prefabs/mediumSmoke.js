angular
    .module('prefabs.mediumSmoke', [])
    .factory('MediumSmokePrefab', [
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
                                    colorize: true,

                                    // Particle groups are broken, just add something
                                    // so the particle system doesn't add new groups
                                    mediumSmoke: true
                                },
                                emitter: {
                                    type: 'cube',
                                    acceleration: [0, 0, 0],
                                    accelerationSpread: [0.15, 0.25, 0.15],
                                    positionSpread: [0.5, 0, 0.5],
                                    velocity: [0, 2.3, 0],
                                    velocitySpread: [0, 0, 0],
                                    particlesPerSecond: 1,
                                    sizeStart: 3,
                                    sizeEnd: 1.1,
                                    opacityStart: 1,
                                    opacityEnd: 0,
                                    colorStart: '#000000',
                                    particleCount: 10
                                }
                            }
                        }
                    };

                return assembly;
            };
        }
    ]);
