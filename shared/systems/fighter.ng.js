angular
    .module('systems.fighter', [
        'ces',
        'engine.entity-builder',
        'engine.util',
        'three'
    ])
    .factory('FighterSystem', function($log, System, States, EntityBuilder, IbUtils, THREE) {
        'use strict';

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

                    fighterComponent.attackCooldownTimer = 0.0;

                    fighterComponent.attack = function(targetPosition) {

                        if (fighterComponent.attackCooldownTimer > 0) {
                            return;
                        }

                        fighterComponent.attackCooldownTimer = fighterComponent.attackCooldown;

                        var wieldItemComponent = entity.getComponent('wieldItem');

                        if (wieldItemComponent && wieldItemComponent._rItem) {
                            wieldItemComponent._rItem.doAttackAnimation();

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
                                        indexH: IbUtils.spriteSheetIdToXY(wieldItemComponent.rhand.image).h,
                                        indexV: IbUtils.spriteSheetIdToXY(wieldItemComponent.rhand.image).v
                                    },
                                    projectile: {
                                        speed: 8,
                                        targetPosition: targetPosition,
                                        ownerUuid: entity.uuid,
                                        attribute1: wieldItemComponent.rhand.damage
                                    },
                                    collisionReporter: {

                                    }
                                }
                            });

                            var offset = new THREE.Vector3(0.3, 0, 0.1);
                            offset.applyQuaternion(entity.quaternion);

                            projectile.position.copy(entity.position);
                            projectile.position.add(offset);

                            world.addEntity(projectile);
                        } else {
                            // Dash like before
                        }
                    };
                });

            },
            update: function(dTime) {
                var me = this;

                var fighterEntities = me.world.getEntities('fighter');

                fighterEntities.forEach(function(entity) {
                    var fighterComponent = entity.getComponent('fighter');

                    if (fighterComponent) {
                        if (fighterComponent.attackCooldownTimer > 0) {
                            fighterComponent.attackCooldownTimer -= dTime;
                        }
                    }
                });

            }
        });
    });
