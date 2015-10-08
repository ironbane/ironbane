angular
    .module('systems.projectile', [
        'ces',
        'three',
        'engine.entity-cache'
    ])
    .factory('ProjectileSystem', ["$log", "System", "THREE", "$entityCache", function($log, System, THREE, $entityCache) {
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
                    var projectileComponent = entity.getComponent('projectile');

                    projectileComponent._canDeliverEffect = true;
                    projectileComponent._owner = world.scene.getObjectByProperty('uuid', projectileComponent.ownerUuid);

                    var inventorySystem = world.getSystem('inventory');
                    projectileComponent._item = inventorySystem.findItemByUuid(projectileComponent._owner, projectileComponent.itemUuid);

                    if (!projectileComponent._owner) {
                        $log.error('Error fetching projectile owner from uuid! ', projectileComponent);
                    }

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
                            var vec = rigidBodyComponent.getBulletVec(launchVelocity);
                            rigidBodyComponent.rigidBody.setLinearVelocity(vec);
                        });
                    }

                    // Make sure to remove it after a while
                    setTimeout(function() {
                        world.removeEntity(entity);
                    }, 5000);
                });

                world.entityAdded('projectile', 'collisionReporter').add(function(entity) {
                    var collisionReporterComponent = entity.getComponent('collisionReporter'),
                        projectile = entity.getComponent('projectile');

                    collisionReporterComponent.collisionStart.add(function(info) {
                        let victim = info.other,
                            attacker = projectile._owner,
                            weapon = projectile._item;

                        if (!projectile._canDeliverEffect) {
                            return;
                        }

                        if (attacker && attacker.uuid === victim.uuid) {
                            return;
                        }

                        if (victim.hasComponent('damageable')) {
                            if (attacker.hasComponent('player')) {
                                if (victim.hasComponent('player') || (victim.hasComponent('fighter') && victim.getComponent('fighter').faction === 'human')) {
                                    return;
                                }
                            }

                            if (!attacker.hasComponent('player')) {
                                if (attacker.hasComponent('fighter') && victim.hasComponent('fighter') && victim.getComponent('fighter').faction === attacker.getComponent('fighter').faction) {
                                    return;
                                }
                            }

                            if (victim.hasComponent('netSend') || attacker.hasComponent('netSend')) {
                                // console.log('projectile[' + entity.uuid + ']', attacker.name + '[' + attacker.uuid + ']', victim.name + '[' + victim.uuid + ']', projectile._canDeliverEffect, weapon.name);
                                world.publish('combat:damageEntity', victim, attacker, weapon);
                            }
                        }

                        //console.log('projectile[' + entity.uuid + ']', attacker.name + '[' + attacker.uuid + ']', victim.name + '[' + victim.uuid + ']', projectile._canDeliverEffect, weapon.name);
                    });
                });
            },
            update: function() {
                var me = this;

                var projectileEntities = me.world.getEntities('projectile');

                projectileEntities.forEach(function(entity) {
                    var rigidBodyComponent = entity.getComponent('rigidBody');

                    if (rigidBodyComponent && rigidBodyComponent.rigidBody) {
                        var currentVel = rigidBodyComponent.rigidBody.getLinearVelocity().toTHREEVector3();
                        if (currentVel.lengthSq() > 1.0) {
                            currentVel.normalize();
                            entity.lookAt(entity.position.clone().add(currentVel));
                        }
                        else {
                            var projectileComponent = entity.getComponent('projectile');
                            projectileComponent._canDeliverEffect = false;
                        }
                    }
                });

            }
        });
    }]);
