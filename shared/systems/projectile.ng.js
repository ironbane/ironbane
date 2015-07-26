angular
    .module('systems.projectile', [
        'ces'
    ])
    .factory('ProjectileSystem', function($log, System) {
            'use strict';

            var calculateFiringAngle = function(startPosition, targetPosition, speed, throwHigh) {
                throwHigh = throwHigh || false;

                var targetTransform = targetPosition.clone();
                var myTransform = startPosition.clone();

                var y = targetTransform .y - myTransform .y;

                targetTransform.y = myTransform.y = 0;

                var x = targetTransform.sub(myTransform).length();

                var v = speed;
                var g = 10;

                var sqrt = (v*v*v*v) - (g * (g * (x*x) + 2 * y * (v*v)));

                // Not enough range
                var result;

                if (sqrt < 0) {
                    console.log('out of range')
                    result = Math.PI*0.15;
                }
                else {
                    sqrt = Math.sqrt(sqrt);

                    // DirectFire chooses the low trajectory, otherwise high trajectory.
                    if (!throwHigh) {
                        result = Math.atan(((v*v) - sqrt) / (g*x));
                    } else {
                        result = Math.atan(((v*v) + sqrt) / (g*x));
                    }

                }

                return result;
            };

            return System.extend({
                addedToWorld: function(world) {
                    this._super(world);

                    world.entityAdded('projectile').add(function(entity) {
                        var projectileComponent = entity.getComponent('projectile');

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
                        launchVelocity.applyQuaternion( quat );

                        // debug.drawVector(launchVelocity, entity.position, 0xFF0000, true);

                        var rigidBodyComponent = entity.getComponent('rigidBody');

                        entity.lookAt(entity.position.clone().add(launchVelocity));

                        if (rigidBodyComponent) {
                            rigidBodyComponent.loadPromise.then(function () {
                                var vec = rigidBodyComponent.getBulletVec(launchVelocity);
                                rigidBodyComponent.rigidBody.setLinearVelocity(vec);
                            })
                        }

                        // Make sure to remove it after a while
                        setTimeout(function () {
                            world.removeEntity(entity);
                        }, 5000);

                        var collisionReporterComponent = entity.getComponent('collisionReporter');
                        if (collisionReporterComponent) {
                            collisionReporterComponent.collisionStart.add(function (result) {
                                console.log('collision!');
                                // var rbc = entity.getComponent('rigidBody');

                                // if (rbc && rbc.rigidBody) {
                                //     rbc.rigidBody.setLinearVelocity(rbc.getBulletVec(0,0,0));
                                //     rbc.rigidBody.setGravity(0);
                                //     // rbc.rigidBody.setLinearFactor(rbc.getBulletVec(0,0,0));
                                //     // rbc.rigidBody.setAngularFactor(rbc.getBulletVec(0,0,0));
                                //     // rbc.rigidBody.setActivationState(5);
                                //     // rbc.rigidBody.activate(0);
                                // }

                                entity.removeComponent('collisionReporter');
                                entity.removeComponent('rigidBody');
                            });
                        }

                    });
                },
                update: function(dTime) {
                    var me = this;

                    var projectileEntities = me.world.getEntities('projectile');

                    projectileEntities.forEach(function(entity) {
                        var rigidBodyComponent = entity.getComponent('rigidBody');

                        if (rigidBodyComponent && rigidBodyComponent.rigidBody) {
                            var currentVel = rigidBodyComponent.rigidBody.getLinearVelocity().toTHREEVector3();
                            currentVel.normalize();
                            entity.lookAt(entity.position.clone().add(currentVel));
                        }
                    });

                }
            });
        }
    );
