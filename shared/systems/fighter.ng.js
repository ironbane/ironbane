angular
    .module('systems.fighter', [
        'ces',
        'engine.entity-builder',
        'engine.util',
        'three'
    ])
    .factory('FighterSystem', function($log, System, States, EntityBuilder, IbUtils, THREE) {
        'use strict';

        var attackTypes = ['lhand', 'rhand'];

        return System.extend({
            addedToWorld: function(world) {
                this._super(world);

                world.subscribe('combat:primaryAttack', function(entity, targetVector) {
                    // when coming from net, it's not a Vector3 anymore
                    var target = new THREE.Vector3();
                    target.copy(targetVector);

                    var fighter = entity.getComponent('fighter');
                    if (fighter) {
                        fighter.attack(target);
                    }
                });

                world.entityAdded('fighter').add(function(entity) {
                    var fighterComponent = entity.getComponent('fighter');

                    fighterComponent.attackCooldownTimer = {};

                    attackTypes.forEach(function (attackType) {
                        fighterComponent.attackCooldownTimer[attackType] = 0.0;
                    });

                    var attackWithOneHand = function (handMesh, item, startOffset, targetPosition) {

                        handMesh.doAttackAnimation();

                        if (!item.image) {
                            // Do a regular dash
                            var damageSystem = world.getSystem('damage');
                            var direction = targetPosition.clone().sub(entity.position).normalize();
                            damageSystem.dash(entity, direction, 'dealDamage');
                        }

                        // Throw the weapon
                        var projectile = EntityBuilder.build('projectile', {
                            components: {
                                rigidBody: {
                                    shape: {
                                        type: 'sphere',
                                        radius: 0.1
                                    },
                                    mass: 1,
                                    friction: 0.0,
                                    restitution: 0,
                                    allowSleep: false,
                                    lock: {
                                        position: {
                                            x: false,
                                            y: false,
                                            z: false
                                        },
                                        rotation: {
                                            x: true,
                                            y: true,
                                            z: true
                                        }
                                    },
                                    group: 'projectiles',
                                    collidesWith: ['level']
                                },
                                quad: {
                                    transparent: true,
                                    texture: 'images/spritesheets/items.png',
                                    style: 'projectile',
                                    numberOfSpritesH: 16,
                                    numberOfSpritesV: 128,
                                    width: 0.5,
                                    height: 0.5,
                                    indexH: IbUtils.spriteSheetIdToXY(item.image).h,
                                    indexV: IbUtils.spriteSheetIdToXY(item.image).v
                                },
                                projectile: {
                                    speed: item.projectileSpeed || 12,
                                    targetPosition: targetPosition,
                                    ownerUuid: entity.uuid,
                                    attribute1: item.damage
                                },
                                collisionReporter: {

                                }
                            }
                        });

                        var offset = startOffset;
                        offset.applyQuaternion(entity.quaternion);

                        projectile.position.copy(entity.position);
                        projectile.position.add(offset);

                        world.addEntity(projectile);
                    }

                    fighterComponent.attack = function(targetPosition) {
                        var wieldItemComponent = entity.getComponent('wieldItem');

                        if (wieldItemComponent) {
                            attackTypes.forEach(function (attackType) {
                                var handMesh = attackType === 'lhand' ? '_lItem' : '_rItem';

                                if (wieldItemComponent[handMesh] &&
                                    fighterComponent.attackCooldownTimer[attackType] <= 0) {
                                    fighterComponent.attackCooldownTimer[attackType] = wieldItemComponent[attackType].attackCooldown || 3;
                                    attackWithOneHand(wieldItemComponent[handMesh],
                                        wieldItemComponent[attackType],
                                        attackType === 'lhand' ? new THREE.Vector3(-0.3, 0, 0.1) : new THREE.Vector3(0.3, 0, 0.1),
                                        targetPosition);
                                }
                            });
                        }

                    };
                });

            },
            update: function(dTime) {
                var me = this;

                var fighterEntities = me.world.getEntities('fighter');

                fighterEntities.forEach(function(entity) {
                    // Not sure whether this belongs in wieldItem or in fighter
                    var fighterComponent = entity.getComponent('fighter');

                    if (fighterComponent) {
                        attackTypes.forEach(function (attackType) {
                            if (fighterComponent.attackCooldownTimer[attackType] > 0) {
                                fighterComponent.attackCooldownTimer[attackType] -= dTime;
                            }
                        });
                    }
                });

            }
        });
    });
