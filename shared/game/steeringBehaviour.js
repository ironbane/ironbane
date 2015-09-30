angular
    .module('game.steeringBehaviour', [
        'engine.util'
    ])
    .factory('SteeringBehaviour', ["Class", "IbUtils", function(Class, IbUtils) {
            'use strict';

            var btVec3 = new Ammo.btVector3();

            return Class.extend({
                init: function(entity) {
                    this.entity = entity;

                    var steeringBehaviourComponent = entity.getComponent('steeringBehaviour');

                    this.speed = steeringBehaviourComponent.speed;
                    this.maxSpeed = steeringBehaviourComponent.maxSpeed;

                    // Wander
                    this.wanderRadius = steeringBehaviourComponent.wanderRadius;
                    this.wanderDistance = steeringBehaviourComponent.wanderDistance;
                    this.wanderJitter = steeringBehaviourComponent.wanderJitter;
                    this.wanderTarget = new THREE.Vector3();

                    var rigidBodyComponent = entity.getComponent('rigidBody');

                    if (!rigidBodyComponent) {
                        console.error('No rigidBody component present for entity with SteeringBehaviour!');
                    }

                    this.rigidBody = rigidBodyComponent.rigidBody;
                },
                update: function () {
                    if (!this.rigidBody) {
                        // There might be some delay between adding the rigidBody component
                        // and the actual rigidbody, as calculations may need to be done in ammo
                        var rigidBodyComponent = this.entity.getComponent('rigidBody');

                        if (rigidBodyComponent.rigidBody) {
                            this.rigidBody = rigidBodyComponent.rigidBody;
                        }
                    }
                },
                brake: function (amount) {
                    var currentVel = this.rigidBody.getLinearVelocity().toTHREEVector3();
                    currentVel.multiplyScalar(-amount);

                    btVec3.setValue(currentVel.x, 0, currentVel.z);
                    this.rigidBody.applyCentralImpulse(btVec3);
                },
                seek: function(targetPos) {
                    if (this.rigidBody) {
                        var toTarget = targetPos.clone().sub(this.entity.position);

                        //calculate the distance to the target position
                        var dist = toTarget.lengthSq();
                        var brakeLimiter = Math.min(1.0, dist);
                        var desiredVelocity = toTarget.normalize().multiplyScalar(this.speed);
                        //.multiplyScalar(brakeLimiter);

                        var currentVel = this.rigidBody.getLinearVelocity().toTHREEVector3();
                        currentVel.y = 0;
                        desiredVelocity.sub(currentVel);

                        btVec3.setValue(desiredVelocity.x, 0, desiredVelocity.z);
                        this.rigidBody.applyCentralImpulse(btVec3);
                    }
                },
                // flee: function(targetPos) {

                //     var desiredVelocity = this.entity.position.clone().sub(targetPos).normalize().multiplyScalar(this.maxSpeed);
                //     return desiredVelocity.sub(this.entity.velocity);
                // },
                arrive: function(targetPos, deceleration) {

                    deceleration = deceleration || 1.0;

                    if (this.rigidBody) {
                        var toTarget = targetPos.clone().sub(this.entity.position);

                        //calculate the distance to the target position
                        var dist = toTarget.length();

                        if ( dist > 0 ) {


                            var decelerationTweaker = 0.3;

                            var speed = (this.speed * dist) / (deceleration / decelerationTweaker);
                            speed = Math.min(speed, this.maxSpeed);


                            var desiredVelocity = toTarget.multiplyScalar(speed/dist);

                            var currentVel = this.rigidBody.getLinearVelocity();
                            currentVel = currentVel.toTHREEVector3();
                            currentVel.y = 0;
                            desiredVelocity.sub(currentVel);

                            // return desiredVelocity.sub(this.entity.velocity);
                            btVec3.setValue(desiredVelocity.x, 0, desiredVelocity.z);
                            this.rigidBody.applyCentralImpulse(btVec3);

                        }
                    }
                }
                // pursuit: function(evader) {

                //     var toEvader = evader.position.clone().sub(this.entity.position);

                //     var relativeHeading = this.entity.heading.dot(evader.heading);

                //     if ( toEvader.dot(this.entity.heading) > 0 && relativeHeading < -0.95 ) {
                //         return this.Seek(evader.position);
                //     }

                //     var lookAheadTime = toEvader.length() / (this.maxSpeed + evader.velocity.length());

                //     var seek = evader.position.clone().add(evader.velocity.clone().multiplyScalar(lookAheadTime));

                //     return this.Seek(seek);
                // },
                // evade: function(pursuer) {
                //     var toPursuer = pursuer.position.clone().sub(this.entity.position);

                //     var lookAheadTime = toPursuer.length() / (this.maxSpeed + pursuer.velocity.length());

                //     return this.Flee(pursuer.position.clone().add(pursuer.velocity.clone().multiplyScalar(lookAheadTime)));
                // },
                // turnAroundTime: function(entity, targetPos) {
                //     var toTarget = targetPos.clone().sub(entity.position);

                //     var dot = entity.heading.dot(toTarget);

                //     var coefficient = 0.5;

                //     return (dot - 1.0) * -coefficient;
                // },
                // resetWander: function() {
                //     this.wanderTarget = new THREE.Vector3();
                // },
                // wander: function() {

                //     this.wanderTarget.add(new THREE.Vector3(RandomClamped() * this.wanderJitter,
                //     0,
                //     util.randomClamped() * this.wanderJitter));

                //     this.wanderTarget.normalize().multiplyScalar(this.wanderRadius);

                //     var offset = this.entity.heading.clone().multiplyScalar(this.wanderDistance);
                //     return offset.add(this.wanderTarget);
                // },
                // interpose: function(entityA, entityB) {

                //     var midPoint = entityA.position.clone().add(entityB.position).multiplyScalar(0.5);

                //     var timeToReachMidPoint = this.entity.position.clone().sub(midPoint).length() / this.maxSpeed;

                //     var posA = unitA.position.clone().add(unitA.velocity.clone.multiplyScalar(timeToReachMidPoint));
                //     var posB = unitB.position.clone().add(unitB.velocity.clone.multiplyScalar(timeToReachMidPoint));

                //     midPoint = posA.add(posB).multiplyScalar(0.5);

                //     return Arrive(midPoint, Deceleration.FAST);
                // }
            });
        }]
    )
