angular
    .module('systems.damage', [
        'engine.entity-builder',
        'engine.char-builder',
        'engine.util',
        'three',
        'ces'
    ])
    .factory('DamageSystem', function($log, System, EntityBuilder, CharBuilder, IbUtils, THREE) {
            'use strict';

            return System.extend({
                addedToWorld: function(world) {
                    this._super(world);

                    world.entityAdded('damageable').add(function(entity) {
                        var damageableComponent = entity.getComponent('damageable');
                    });
                },
                _spawnParticle: function (indexH, indexV, amount, position) {
                    var me = this;
                      CharBuilder.getSpriteSheetTile('images/ui/stats.png',
                            indexH,
                            indexV,
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
                                                accelerationSpread: [0.2, 0.2, 0.2],
                                                positionSpread: [0.2, 0.2, 0.2],
                                                velocity: [0, 1, 0],
                                                velocitySpread: [0, 0, 0],
                                                duration: 0.5,
                                                // particlesPerSecond: 1,
                                                sizeStart: 1.0,
                                                sizeEnd: 0.5,
                                                angleStart: Math.PI,
                                                angleEnd: Math.PI,
                                                // colorStart: 'blue',
                                                // colorEnd: 'white',
                                                particleCount: amount
                                            }
                                        }
                                    }
                                });

                                particle.position.copy(position);
                                me.world.addEntity(particle);

                            });
                },
                addDamageParticles: function (type, amount, position) {

                    var halfParticle = false;
                    if (amount % 2 == 1) {
                        amount--;
                        halfParticle = true;
                    }

                    switch(type) {
                        case 'health':
                            this._spawnParticle(3, 1, amount, position);
                            if (halfParticle) {
                                this._spawnParticle(3, 2, 1, position);
                            }
                            break;
                        case 'armor':
                            this._spawnParticle(1, 1, amount, position);
                            if (halfParticle) {
                                this._spawnParticle(2, 1, 1, position);
                            }
                            break;
                    }

                },
                update: function(dTime) {
                    var me = this;

                    var damageableEntities = me.world.getEntities('damageable');

                    damageableEntities.forEach(function(entity) {
                        var damageableComponent = entity.getComponent('damageable');
                        var healthComponent = entity.getComponent('health');
                        var armorComponent = entity.getComponent('armor');

                        if (damageableComponent) {
                            damageableComponent.sources.forEach(function(source) {

                                switch (source.type) {
                                    case 'damage':
                                        var damage = source.damage;

                                        if (armorComponent) {
                                            var armorDamageDone = Math.min(armorComponent.value, damage);
                                            damage -= armorDamageDone;
                                            armorComponent.value -= armorDamageDone;
                                            me.addDamageParticles('armor', armorDamageDone, entity.position);
                                            console.log('armor', armorDamageDone, entity.position);
                                        }

                                        if (healthComponent) {
                                            var healthDamageDone = Math.min(healthComponent.value, damage);
                                            damage -= healthDamageDone;
                                            healthComponent.value -= healthDamageDone;
                                            me.addDamageParticles('health', healthDamageDone, entity.position);
                                            console.log('health', healthDamageDone, entity.position);
                                        }
                                    break;
                                }
                            });
                            damageableComponent.sources = [];
                        }
                    });
                }
            });
        }
    );
