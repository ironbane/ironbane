angular
    .module('systems.fighter', [
        'ces',
        'engine.entity-builder',
        'engine.util',
        'three',
        'game.services.globalsound'
    ])
    .factory('FighterSystem', ["$log", "System", "States", "EntityBuilder", "IbUtils", "THREE", "GlobalSound", function($log, System, States, EntityBuilder, IbUtils, THREE, GlobalSound) {
        'use strict';

        var attackTypes = ['lhand', 'rhand'];

        return System.extend({
            addedToWorld: function(world) {
                this._super(world);

                world.subscribe('combat:primaryAttack', function(entity, targetVector) {
                    var fighter = entity.getComponent('fighter');
                    if (fighter) {
                        fighter.attack(targetVector);
                    }
                });

                world.subscribe('fighter:jump', function(entity) {
                    if (Meteor.isClient) {
                        var rigidBodySystem = world.getSystem('rigidbody');
                        rigidBodySystem.applyCentralImpulse(entity, new THREE.Vector3(0,5,0));
                        GlobalSound.play(_.sample(['jump']), entity.position);
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
                                    friction: 2.0,
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
                                    collidesWith: ['level', 'npcs']
                                },
                                quad: {
                                    transparent: true,
                                    texture: 'images/spritesheets/items.png',
                                    style: 'projectile',
                                    numberOfSpritesH: 16,
                                    numberOfSpritesV: 128,
                                    width: 0.5,
                                    height: 0.5,
                                    indexH: IbUtils.spriteSheetIdToXY(item.image, 16).h,
                                    indexV: IbUtils.spriteSheetIdToXY(item.image, 16).v
                                },
                                projectile: {
                                    speed: item.projectileSpeed || 12,
                                    targetPosition: targetPosition,
                                    ownerUuid: entity.uuid,
                                    itemUuid: item.uuid
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
                            var playedSound = false;
                            attackTypes.forEach(function (attackType) {
                                var handMesh = attackType === 'lhand' ? '_lItem' : '_rItem';

                                if (wieldItemComponent[handMesh] &&
                                    wieldItemComponent[attackType] &&
                                    fighterComponent.attackCooldownTimer[attackType] <= 0) {
                                    fighterComponent.attackCooldownTimer[attackType] = wieldItemComponent[attackType].attackCooldown || 3;

                                    if (wieldItemComponent[attackType].type === 'weapon') {
                                        attackWithOneHand(wieldItemComponent[handMesh],
                                            wieldItemComponent[attackType],
                                            attackType === 'lhand' ? new THREE.Vector3(-0.3, 0, 0.1) : new THREE.Vector3(0.3, 0, 0.1),
                                            targetPosition);

                                        if (!playedSound) {
                                            playedSound = true;
                                            GlobalSound.play(_.sample(['swing1']), entity.position);
                                        }
                                    }
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
    }]);
