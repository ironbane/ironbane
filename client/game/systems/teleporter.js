angular
    .module('systems.teleporter', [
        'engine.entity-builder',
        'ces.entityProcessingSystem',
        'three'
    ])
    .factory('TeleporterSystem', ["EntityProcessingSystem", "EntityBuilder", "THREE", function(EntityProcessingSystem, EntityBuilder, THREE) {
            'use strict';

            return EntityProcessingSystem.extend({
                init: function() {
                    this._super('teleporter');
                },
                onEntityAdded: function (entity) {

                    var teleporterComponent = entity.getComponent('teleporter');

                    teleporterComponent._particleEntities = [];

                    var isExit = teleporterComponent.type === 'exit';

                    var particle;

                    var colorfn = function(i) {
                        var index = Math.abs(i) % 2;
                        return new THREE.Color(['#aa9cff', '#14feff'][index]);
                    };

                    particle = EntityBuilder.build('particle', {
                        components: {
                            particleEmitter: {
                                group: {
                                    texture: 'images/particles/circle.png',
                                    hasPerspective: true,
                                    colorize: true,
                                    // depthWrite: true,
                                    blending: THREE.NormalBlending,
                                    teleportExit: isExit
                                },
                                emitter: {
                                    type: 'cube',
                                    // acceleration: [0, 0, 0],
                                    // accelerationSpread: [0.0, 0.0, 0.0],
                                    // positionSpread: [0.5, 0, 0.5],
                                    // velocity: [0, 0.5, 0],
                                    // velocitySpread: [0, 0, 0],
                                    particlesPerSecond: 1,
                                    sizeStart: isExit ? 0.1 : 3.0,
                                    sizeEnd: isExit ? 3.0 : 0.1,
                                    opacityStart: 0,
                                    opacityMiddle: 1.0,
                                    opacityEnd: 0,
                                    colorStartFn: colorfn,
                                    colorMiddleFn: colorfn,
                                    colorEndFn: colorfn,
                                    // colorStartSpread: new THREE.Vector3(0.1, 0.1, 0.1),
                                    // colorMiddle: '#1480ff',
                                    // colorEnd: '#14feff',
                                    particleCount: 4
                                }
                            }
                        }
                    });

                    particle.position.copy(entity.position);
                    this.world.addEntity(particle);
                    teleporterComponent._particleEntities.push(particle);

                    particle = EntityBuilder.build('particle', {
                        components: {
                            particleEmitter: {
                                group: {
                                    texture: 'images/particles/spark.png',
                                    hasPerspective: true,
                                    colorize: true,
                                    // depthWrite: true,
                                    blending: THREE.NormalBlending,
                                    teleportExit: isExit,
                                    maxAge: 1.0
                                },
                                emitter: {
                                    type: 'sphere',
                                    radius: isExit ? 0.01 : 1.0,
                                    speed: isExit ? 1.0 : -1.0,

                                    acceleration: [-0.5, -0.5, -0.5],
                                    // accelerationSpread: [1.0, 1.0, 1.0],
                                    // positionSpread: [0.5, 0, 0.5],
                                    // velocity: [1, 1, 1],
                                    // velocitySpread: [0.5, 0.5, 0.5],
                                    particlesPerSecond: 5,
                                    sizeStart: 0.8,
                                    // sizeEnd: 3.0,
                                    opacityStart: 0,
                                    opacityMiddle: 1.0,
                                    opacityEnd: 0,
                                    colorStart: '#bffaff',
                                    // colorStartFn: colorfn,
                                    // colorMiddleFn: colorfn,
                                    // colorEndFn: colorfn,
                                    // colorStartSpread: new THREE.Vector3(0.1, 0.1, 0.1),
                                    // colorMiddle: '#1480ff',
                                    // colorEnd: '#14feff',
                                    particleCount: 10
                                }
                            }
                        }
                    });

                    particle.position.copy(entity.position);
                    this.world.addEntity(particle);
                    teleporterComponent._particleEntities.push(particle);

                },
                onEntityRemoved: function (entity) {
                    var teleporterComponent = entity.getComponent('teleporter');

                    var me = this;

                    teleporterComponent._particleEntities.forEach(function (particle) {
                        me.world.removeEntity(particle);
                    });
                }
            });
        }]
    );
