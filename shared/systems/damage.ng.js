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
            _spawnParticle: function(indexH, indexV, amount, position) {
                var me = this;
                CharBuilder.getSpriteSheetTile('images/ui/stats.png',
                    indexH,
                    indexV,
                    4,
                    3).then(function(texture) {
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
            addDamageParticles: function(type, amount, position) {

                var halfParticle = false;
                if (amount % 2 === 1) {
                    amount--;
                    halfParticle = true;
                }

                switch (type) {
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
            addDeathParticles: function(entity, position) {
                var texture = null;

                var quadComponent = entity.getComponent('quad');
                if (quadComponent) {
                    texture = quadComponent._quad.children[0].material.map.clone();
                    texture.needsUpdate = true;
                }

                if (!texture) {
                    $log.debug('Cannot build deathParticle texture for entity ' + entity.name);
                    return;
                }

                var particle = EntityBuilder.build('particle', {
                    components: {
                        particleEmitter: {
                            group: {
                                blending: THREE.NormalBlending,
                                texture: texture
                            },
                            emitter: {
                                type: 'cube',
                                acceleration: [0, -5, 0],
                                // accelerationSpread: [0.2, 0.2, 0.2],
                                positionSpread: [0.2, 0.2, 0.2],
                                velocity: [0, 2, 0],
                                velocitySpread: [5, 0, 5],
                                duration: 0.2,
                                // particlesPerSecond: 1,
                                sizeStart: 0.5,
                                sizeEnd: 0.5,
                                angleStart: Math.PI,
                                angleEnd: Math.PI,
                                // colorStart: 'blue',
                                // colorEnd: 'white',
                                particleCount: 8 * 8,
                                numberOfSpritesH: 3 * 8,
                                numberOfSpritesV: 8 * 9
                            }
                        }
                    }
                });

                particle.position.copy(position);
                this.world.addEntity(particle);
            },
            update: function() {
                var me = this;

                var damageableEntities = me.world.getEntities('damageable');

                damageableEntities.forEach(function(entity) {
                    var damageableComponent = entity.getComponent('damageable');
                    var healthComponent = entity.getComponent('health');
                    var armorComponent = entity.getComponent('armor');

                    if (damageableComponent) {
                        damageableComponent.sources.forEach(function(source) {
                            if (entity.hasComponent('player')) {
                                // if the victim of damage is a player, make sure that it was not inflicted by another player (no pvp)
                                if (source.sourceId) {
                                    var playerAttacker = me.world.getEntityById(source.sourceId, 'player');
                                    //$log.debug('player attacker', source, playerAttacker);
                                    if (playerAttacker) {
                                        return;
                                    }
                                }
                            }

                            switch (source.type) {
                                case 'damage':
                                    var damage = source.damage;

                                    if (armorComponent) {
                                        var armorDamageDone = Math.min(armorComponent.value, damage);
                                        damage -= armorDamageDone;
                                        armorComponent.value -= armorDamageDone;
                                        me.addDamageParticles('armor', armorDamageDone, entity.position);
                                        $log.debug('armor', armorDamageDone, entity.position);
                                    }

                                    if (healthComponent) {
                                        var healthDamageDone = Math.min(healthComponent.value, damage);
                                        damage -= healthDamageDone;
                                        healthComponent.value -= healthDamageDone;
                                        me.addDamageParticles('health', healthDamageDone, entity.position);
                                        $log.debug('health', healthDamageDone, entity.position);

                                        if (healthComponent.value <= 0) {
                                            // We died, so add proper particles
                                            // and remove ourselves from the world
                                            me.addDeathParticles(entity, entity.position);
                                            me.world.removeEntity(entity);
                                        }
                                    }
                                    break;
                            }
                        });
                        damageableComponent.sources = [];
                    }
                });
            }
        });
    });
