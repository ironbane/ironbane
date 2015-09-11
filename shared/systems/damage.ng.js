angular
    .module('systems.damage', [
        'engine.entity-builder',
        'engine.util',
        'game.ui.bigMessages.bigMessagesService',
        'three',
        'ces',
        'game.services.globalsound'
    ])
    .factory('DamageSystem', function($log, System, EntityBuilder, IbUtils, THREE, BigMessagesService, GlobalSound) {
        'use strict';

        var DASH_TIME = 0.2;

        return System.extend({
            addedToWorld: function(world) {
                this._super(world);

                world.entityAdded('damageable').add(function(entity) {
                    var damageableComponent = entity.getComponent('damageable');

                    damageableComponent.sources = [];
                    damageableComponent.dashType = 'receiveDamage';
                    damageableComponent.dashTimer = 0.0;
                    damageableComponent.dashDirection = new THREE.Vector3();
                });

                world.subscribe('combat:damageEntity', function(victimEntity, sourceEntity, item) {
                    var damageableComponent = victimEntity.getComponent('damageable');
                    if (damageableComponent) {
                        damageableComponent.sources.push({
                            type: 'damage',
                            sourceEntity: sourceEntity,
                            damage: item.damage
                        });
                    }
                });
            },
            _spawnParticle: function(indexH, indexV, amount, position) {
                var me = this;

                var particle = EntityBuilder.build('particle', {
                    components: {
                        particleEmitter: {
                            group: {
                                blending: THREE.NormalBlending,
                                sprite: {
                                    image: 'images/ui/stats.png',
                                    tile: {
                                        h: indexH,
                                        v: indexV,
                                        nH: 4,
                                        nV: 3
                                    }
                                }
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

                setTimeout(function () {
                    me.world.removeEntity(particle);
                }, 5000);

            },
            addDamageParticles: function(type, amount, position) {

                var halfParticle = false;
                if (amount % 1 === 0.5) {
                    amount -= 0.5;
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

                var me = this;
                setTimeout(function () {
                    me.world.removeEntity(particle);
                }, 5000);
            },
            dash: function (entity, direction, type) {
                var damageableComponent = entity.getComponent('damageable');

                if (damageableComponent) {
                    damageableComponent.dashTimer = DASH_TIME;
                    damageableComponent.dashType = type;
                    damageableComponent.dashDirection.copy(direction);
                }
            },
            update: function(dTime) {
                var me = this;

                var damageableEntities = me.world.getEntities('damageable');

                damageableEntities.forEach(function(entity) {
                    var damageableComponent = entity.getComponent('damageable');
                    var healthComponent = entity.getComponent('health');
                    var armorComponent = entity.getComponent('armor');
                    var quadComponent = entity.getComponent('quad');
                    var wieldItemComponent = entity.getComponent('wieldItem');

                    if (damageableComponent.dashTimer >= 0) {
                        damageableComponent.dashTimer -= dTime;
                    }

                    if (quadComponent && Meteor.isClient && quadComponent._quad) {
                        var time = damageableComponent.dashTimer;
                        if (time > (DASH_TIME*0.5)) {
                            time = (DASH_TIME*0.5)-(time-(DASH_TIME*0.5));
                        }
                        time /= DASH_TIME;
                        quadComponent.offsetPosition.copy(new THREE.Vector3().lerp(damageableComponent.dashDirection, time))

                        if (wieldItemComponent) {
                            wieldItemComponent.offsetPosition.copy(quadComponent.offsetPosition);
                        }

                        quadComponent._quad.children[0].material.color.g = 1 - time;
                        quadComponent._quad.children[0].material.color.b = 1 - time;
                    }

                    // blink red when low on health
                    if (healthComponent && quadComponent && quadComponent._quad) {
                        var max = parseInt(healthComponent.max / 3, 10);

                        if (healthComponent.value < max) {
                            var mp = 0.5 + (Math.cos(new Date().getTime() / 1000 * (5)) / 2);

                            if (damageableComponent.dashType === 'receiveDamage') {
                                quadComponent._quad.children[0].material.color.g = mp;
                                quadComponent._quad.children[0].material.color.b = mp;
                            }
                            if (damageableComponent.dashType === 'dealDamage') {
                                quadComponent._quad.children[0].material.color.g = mp / 2;
                                quadComponent._quad.children[0].material.color.b = mp;
                            }
                        }
                    }

                    if (damageableComponent) {
                        damageableComponent.sources.forEach(function(source) {
                            if (entity.hasComponent('player')) {
                                // if the victim of damage is a player, make sure that it was not inflicted by another player (no pvp)
                                if (source.sourceEntity) {
                                    var playerComponent = source.sourceEntity.getComponent('player');

                                    if (playerComponent) {
                                        return;
                                    }
                                }
                            }

                            if (!source.sourceEntity) {
                                // Possible that a request was sent when the entity was already removed from the world
                                return;
                            }

                            var direction = entity.position.clone()
                                .sub(source.sourceEntity.position).setY(0.3).normalize();

                            me.dash(entity, direction, 'receiveDamage');

                            switch (source.type) {
                                case 'damage':
                                    var damage = source.damage;

                                    GlobalSound.play(_.sample(['hit1','hit2','hit3']), entity.position);

                                    if (armorComponent) {
                                        var armorDamageDone = Math.min(armorComponent.value, damage);
                                        damage -= armorDamageDone;
                                        armorComponent.value -= armorDamageDone;

                                        if (Meteor.isClient) {
                                            me.addDamageParticles('armor', armorDamageDone, entity.position);
                                        }

                                        // $log.debug('armor', armorDamageDone, entity.position);
                                    }

                                    if (healthComponent) {
                                        var healthDamageDone = Math.min(healthComponent.value, damage);
                                        damage -= healthDamageDone;
                                        healthComponent.value -= healthDamageDone;

                                        if (Meteor.isClient) {
                                            me.addDamageParticles('health', healthDamageDone, entity.position);
                                        }

                                        // $log.debug('health', healthDamageDone, entity.position);

                                        if (healthComponent.value <= 0) {
                                            // We died, so add proper particles
                                            // and remove ourselves from the world
                                            if (Meteor.isClient) {
                                                me.addDeathParticles(entity, entity.position);

                                                GlobalSound.play(_.sample(['die1','die2','die3']), entity.position);

                                                entity.removeComponent('quad');
                                                entity.removeComponent('wieldItem');
                                                entity.removeComponent('fighter');
                                                entity.removeComponent('shadow');
                                                entity.removeComponent('health');
                                                entity.removeComponent('damageable');
                                                entity.removeComponent('armor');
                                                entity.removeComponent('rigidBody');
                                                entity.removeComponent('script');

                                                if (!entity.hasComponent('player')) {
                                                    // me.world.removeEntity(entity);
                                                }
                                                else if (entity.hasComponent('netSend')) {
                                                    BigMessagesService.add('You died!');
                                                }
                                            }
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
