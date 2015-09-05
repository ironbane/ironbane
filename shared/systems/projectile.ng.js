angular
    .module('systems.projectile', [
        'ces',
        'three',
        'engine.entity-cache'
    ])
    .factory('ProjectileSystem', function($log, System, THREE, $entityCache) {
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
                $log.log('out of range');
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

                    var collisionReporterComponent = entity.getComponent('collisionReporter');
                    if (collisionReporterComponent) {
                        collisionReporterComponent.collisionStart.add(function() {
                            entity.removeComponent('collisionReporter');
                            entity.removeComponent('rigidBody');
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

                    if (rigidBodyComponent && rigidBodyComponent.rigidBody) {
                        var currentVel = rigidBodyComponent.rigidBody.getLinearVelocity().toTHREEVector3();
                        currentVel.normalize();
                        entity.lookAt(entity.position.clone().add(currentVel));
                    }

                    var projectileComponent = entity.getComponent('projectile');

                    // Check for entities that can be hit with this projectile
                    // apply the effect (e.g. damage but can also be beneficial)
                    // and flag that we did so
                    if (projectileComponent && projectileComponent._canDeliverEffect) {
                        if (projectileComponent.type === 'damage') {
                            var damageableEntities = me.world.getEntities('damageable');

                            damageableEntities.forEach(function(damageableEntity) {
                                if (damageableEntity !== projectileComponent._owner &&
                                    damageableEntity.position.inRangeOf(entity.position, 1.0)) {

                                    // Only if it isn't a player, otherwise players might 'block' projectiles
                                    if (!damageableEntity.hasComponent('player')) {

                                        // Only publish if the projectile has something to do with the mainPlayer
                                        // Other projectile hit events will be sent over the network
                                        var mainPlayer = $entityCache.get('mainPlayer');

                                        if (mainPlayer === damageableEntity ||
                                            mainPlayer === projectileComponent._owner) {

                                            me.world.publish('combat:damageEntity', damageableEntity, {
                                                sourceEntity: projectileComponent._owner,
                                                type: 'damage',
                                                damage: projectileComponent.attribute1
                                            });
                                        }

                                        projectileComponent._canDeliverEffect = false;
                                    }
                                }
                            });
                        }
                    }
                });

            }
        });
    });
