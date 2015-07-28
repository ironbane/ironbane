angular
    .module('systems.health', [
        'engine.entity-builder',
        'engine.char-builder',
        'engine.util',
        'three',
        'ces'
    ])
    .factory('HealthSystem', function($log, System, EntityBuilder, CharBuilder, IbUtils, THREE) {
            'use strict';

            return System.extend({
                addedToWorld: function(world) {
                    this._super(world);

                    world.entityAdded('health').add(function(entity) {
                        var healthComponent = entity.getComponent('health');
                        healthComponent.damage = function (amount) {
                            // TODO check for armor
                            healthComponent.value -= amount;

                            CharBuilder.getSpriteSheetTile('images/ui/stats.png',
                                3,
                                1,
                                4,
                                3).then(function (texture) {
                                    var particle = EntityBuilder.build('particle', {
                                        components: {
                                            particleEmitter: {
                                                group: {
                                                    blending: THREE.NormalBlending,
                                                    texture: texture
                                                },
                                                emitter: {
                                                    type: 'cube',
                                                    acceleration: [0, 1, 0],
                                                    accelerationSpread: [0, 0, 0],
                                                    velocity: [0, 1, 0],
                                                    velocitySpread: [0, 0, 0],
                                                    particlesPerSecond: 5,
                                                    sizeStart: 1.0,
                                                    sizeEnd: 0.5,
                                                    angleStart: Math.PI,
                                                    angleEnd: Math.PI,
                                                    // colorStart: 'blue',
                                                    // colorEnd: 'white',
                                                    particleCount: 10
                                                }
                                            }
                                        }
                                    });

                                    particle.position.copy(entity.position);
                                    world.addEntity(particle);

                                });
                        };
                    });
                },
                update: function(dTime) {
                    var me = this;

                    var healthEntities = me.world.getEntities('health');

                    healthEntities.forEach(function(entity) {
                        var healthComponent = entity.getComponent('health');

                        if (healthComponent) {
                            if (healthComponent.value < 0) {
                                // console.log('dead');
                            }
                        }
                    });

                }
            });
        }
    );
