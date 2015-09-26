angular
    .module('prefabs.mediumSmoke', [
        'three'
    ])
    .factory('MediumSmokePrefab', [
        'THREE',
        function(THREE) {
            'use strict';

            return function(entityData) {
                var customs = entityData.userData || {},
                    assembly = {
                        components: {
                            particleEmitter: {
                                group: {
                                    texture: 'images/particles/small.png',
                                    hasPerspective: true,
                                    transparent: true,
                                    // colorize: true,
                                    blending: THREE.NormalBlending,

                                    // Particle groups are broken, just add something
                                    // so the particle system doesn't add new groups
                                    mediumSmoke: true
                                },
                                emitter: {
                                    type: 'cube',
                                    acceleration: [0, 0, 0],
                                    accelerationSpread: [0.15, 0.25, 0.15],
                                    positionSpread: [1.0, 0, 1.0],
                                    velocity: [0, 2.3, 0],
                                    velocitySpread: [0, 0, 0],
                                    particlesPerSecond: 3,
                                    sizeStart: 3,
                                    sizeEnd: 3,
                                    opacityStart: 1,
                                    opacityEnd: 0,
                                    colorStart: '#000000',
                                    particleCount: 30
                                }
                            }
                        }
                    };

                return assembly;
            };
        }
    ]);
