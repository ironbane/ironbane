angular
    .module('systems.fighter', [
        'ces',
        'engine.entity-builder',
        'engine.util',
        'three',
        'game.services.globalsound'
    ])
    .factory('FighterSystem', [
        '$log',
        'System',
        'States',
        'EntityBuilder',
        'IbUtils',
        'THREE',
        'GlobalSound',
        function($log, System, States, EntityBuilder, IbUtils, THREE, GlobalSound) {
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
                            rigidBodySystem.applyCentralImpulse(entity, new THREE.Vector3(0, 5, 0));
                            GlobalSound.play(_.sample(['jump']), entity.position);
                        }
                    });

                    world.entityAdded('fighter').add(function(entity) {
                        var fighterComponent = entity.getComponent('fighter');

                        fighterComponent.attackCooldownTimer = {};

                        attackTypes.forEach(function(attackType) {
                            fighterComponent.attackCooldownTimer[attackType] = 0.0;
                        });

                        var attackWithOneHand = function(handMesh, item, startOffset, targetPosition, targetEntity) {
                            // targetEntity is optional: sent by NPC only at the moment

                            handMesh.doAttackAnimation();

                            if (!item.image) {
                                // Do a regular dash
                                var damageSystem = world.getSystem('damage');
                                var toTarget = targetPosition.clone().sub(entity.position);
                                var toTargetEntity = targetEntity.position.clone().sub(entity.position);
                                var direction = toTarget.normalize();

                                if (toTarget.lengthSq() <= item.range * item.range) {
                                    damageSystem.dash(entity, direction, 'dealDamage');
                                    //console.log('dash: ', item.name, toTarget.lengthSq(), ' <= ', (item.range * item.range));
                                    if (targetEntity && (toTargetEntity.lengthSq() <= item.range * item.range)) {
                                        //console.log('dash hit: ', item.name, toTargetEntity.lengthSq(), ' <= ', (item.range * item.range));
                                        world.publish('combat:damageEntity', targetEntity, entity, item);
                                    }
                                }

                                return;
                            }

                            // Throw the weapon
                            var projectile = EntityBuilder.build('projectile', {
                                components: {
                                    rigidBody: {
                                        shape: {
                                            type: 'sphere',
                                            radius: 0.1
                                        },
                                        mass: 0.01,
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
                                        group: entity.hasComponent('player') ? 'playerProjectiles' : 'enemyProjectiles',
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

                                    },
                                    lifespan: {
                                        duration: 5
                                    }
                                }
                            });

                            var offset = startOffset;
                            offset.applyQuaternion(entity.quaternion);

                            projectile.position.copy(entity.position);
                            projectile.position.add(offset);

                            world.addEntity(projectile);
                        };

                        fighterComponent.attack = function(targetPosition, targetEntity) {
                            var wieldItemComponent = entity.getComponent('wieldItem');

                            if (wieldItemComponent) {
                                var playedSound = false;
                                attackTypes.forEach(function(attackType) {
                                    var handMesh = attackType === 'lhand' ? '_lItem' : '_rItem';

                                    if (wieldItemComponent[handMesh] &&
                                        wieldItemComponent[attackType] &&
                                        fighterComponent.attackCooldownTimer[attackType] <= 0) {
                                        fighterComponent.attackCooldownTimer[attackType] = wieldItemComponent[attackType].attackCooldown || 3;

                                        if (wieldItemComponent[attackType].type === 'weapon') {
                                            attackWithOneHand(wieldItemComponent[handMesh],
                                                wieldItemComponent[attackType],
                                                attackType === 'lhand' ? new THREE.Vector3(-0.3, 0, 0.1) : new THREE.Vector3(0.3, 0, 0.1),
                                                targetPosition,
                                                targetEntity);

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
                            attackTypes.forEach(function(attackType) {
                                if (fighterComponent.attackCooldownTimer[attackType] > 0) {
                                    fighterComponent.attackCooldownTimer[attackType] -= dTime;
                                }
                            });
                        }
                    });

                }
            });
        }
    ]);
