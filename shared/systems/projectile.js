angular
    .module('systems.projectile', [
        'ces',
        'three',
        'engine.timing'
    ])
    .factory('ProjectileSystem', [
        '$log',
        'System',
        'THREE',
        'Timer',
        function($log, System, THREE, Timer) {
            'use strict';

            var calculateFiringAngle = function(startPosition, targetPosition, speed, throwHigh) {
                throwHigh = throwHigh || false;

                var targetTransform = targetPosition.clone();
                var myTransform = startPosition.clone();

                var y = targetTransform.y - myTransform.y;

                targetTransform.y = myTransform.y = 0;

                var x = targetTransform.sub(myTransform).length();

                var v = speed;
                var g = 10;

                var sqrt = (v * v * v * v) - (g * (g * (x * x) + 2 * y * (v * v)));

                // Not enough range
                var result;

                if (sqrt < 0) {
                    result = Math.PI * 0.15;
                } else {
                    sqrt = Math.sqrt(sqrt);

                    // DirectFire chooses the low trajectory, otherwise high trajectory.
                    if (!throwHigh) {
                        result = Math.atan(((v * v) - sqrt) / (g * x));
                    } else {
                        result = Math.atan(((v * v) + sqrt) / (g * x));
                    }

                }

                return result;
            };

            return System.extend({
                addedToWorld: function(world) {
                    this._super(world);

                    world.entityAdded('projectile').add(function(entity) {
                        var rigidBodySystem = world.getSystem('rigidbody');
                        var inventorySystem = world.getSystem('inventory');
                        var projectileComponent = entity.getComponent('projectile');

                        projectileComponent._canDeliverEffect = true;
                        projectileComponent._owner = world.scene.getObjectByProperty('uuid', projectileComponent.ownerUuid);

                        if (!projectileComponent._owner) {
                            console.warn('Error fetching projectile owner from uuid! ', projectileComponent);
                            return;
                        }

                        projectileComponent._item = inventorySystem.findItemByUuid(projectileComponent._owner, projectileComponent.itemUuid);

                        var alteredTargetPosition = projectileComponent.targetPosition.clone();
                        alteredTargetPosition.y += 0.2;

                        var launchVelocity = alteredTargetPosition.clone().sub(entity.position);
                        launchVelocity.normalize();

                        var perpVec = launchVelocity.clone().cross(new THREE.Vector3(0, 1, 0));

                        // debug.drawVector(perpVec, entity.position, 0x00FF00, true);

                        var angle = calculateFiringAngle(entity.position, alteredTargetPosition, projectileComponent.speed, false);

                        launchVelocity.multiplyScalar(projectileComponent.speed);
                        launchVelocity.y = 0;

                        var quat = new THREE.Quaternion().setFromAxisAngle(perpVec, angle);
                        launchVelocity.applyQuaternion(quat);

                        // debug.drawVector(launchVelocity, entity.position, 0xFF0000, true);

                        var rigidBodyComponent = entity.getComponent('rigidBody');

                        entity.lookAt(entity.position.clone().add(launchVelocity));

                        if (rigidBodyComponent) {
                            rigidBodyComponent.loadPromise.then(function() {
                                if (rigidBodyComponent && rigidBodyComponent.rigidBody) {
                                    var vec = rigidBodySystem.getBulletVec(launchVelocity);
                                    rigidBodyComponent.rigidBody.setLinearVelocity(vec);
                                } else {
                                    console.error('projectile:99 rigidBody is gone! ', projectileComponent);
                                }
                            });
                        }

                        var collisionReporterComponent = entity.getComponent('collisionReporter');
                        if (collisionReporterComponent) {
                            collisionReporterComponent.collisionStart.add(function() {
                                entity.removeComponent('collisionReporter');
                                projectileComponent._canDeliverEffect = false;
                            });
                        }
                    });
                },
                update: function() {
                    var me = this;

                    var projectileEntities = me.world.getEntities('projectile');

                    projectileEntities.forEach(function(entity) {
                        var rigidBodyComponent = entity.getComponent('rigidBody');
                        var projectileComponent = entity.getComponent('projectile');

                        if (rigidBodyComponent && rigidBodyComponent.rigidBody) {
                            var currentVel = rigidBodyComponent.rigidBody.getLinearVelocity().toTHREEVector3();
                            if (currentVel.lengthSq() > 1.0) {
                                currentVel.normalize();
                                entity.lookAt(entity.position.clone().add(currentVel));
                            }
                        }

                        // Check for entities that can be hit with this projectile
                        // apply the effect (e.g. damage but can also be beneficial)
                        // and flag that we did so
                        if (projectileComponent &&
                            projectileComponent._owner &&
                            projectileComponent._canDeliverEffect) {

                            if (projectileComponent._item && projectileComponent._item.type === 'weapon') {
                                var damageableEntities = me.world.getEntities('damageable');

                                damageableEntities.forEach(function(damageableEntity) {

                                    var fighterComponent = damageableEntity.getComponent('fighter');

                                    var hitSize = 1.0;

                                    var quadComponent = damageableEntity.getComponent('quad');

                                    if (quadComponent) {
                                        hitSize = (quadComponent.width + quadComponent.height) / 2;
                                    }

                                    if (damageableEntity !== projectileComponent._owner &&
                                        damageableEntity.position.inRangeOf(entity.position, hitSize)) {

                                        // Only allow hits if an NPC + player is involved
                                        if ((projectileComponent._owner.hasComponent('player') && !damageableEntity.hasComponent('player')) ||
                                            (!projectileComponent._owner.hasComponent('player') && damageableEntity.hasComponent('player'))) {

                                            // Don't attack human faction NPC
                                            if (fighterComponent && fighterComponent.faction === 'human') {
                                                return;
                                            }

                                            // Only publish if the projectile has something to do with the local client's entities (netSend)
                                            // Other projectile hit events will be sent over the network

                                            // if (damageableEntity.hasComponent('netSend') ||
                                                // projectileComponent._owner.hasComponent('netSend')) {

                                                me.world.publish('combat:damageEntity', damageableEntity, projectileComponent._owner, projectileComponent._item);
                                            // }

                                            projectileComponent._canDeliverEffect = false;
                                        }
                                    }
                                });
                            }
                        }
                    });

                }
            });
        }
    ]);
