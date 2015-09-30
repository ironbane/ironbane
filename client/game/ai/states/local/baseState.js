angular
    .module('game.ai.states.local')
    .factory('BaseState', ["Class", "THREE", "IbUtils", "Patrol", "$rootWorld", function(Class, THREE, IbUtils, Patrol, $rootWorld) {
            'use strict';

            return Class.extend({
                init: function(entity, config, world) {
                    this.entity = entity;
                    this.world = world;

                    _.each(config, function (val, key, list) {
                        // Not guaranteed to a Vector3 but likely.
                        // TODO is there a more robust solution?
                        if (val && val.hasOwnProperty('x') &&
                            val.hasOwnProperty('y') &&
                            val.hasOwnProperty('z')) {
                            list[key] = new THREE.Vector3().copy(val);
                        }
                    });

                    _.extend(this, config);

                    var steeringBehaviourComponent = this.entity.getComponent('steeringBehaviour');
                    if (steeringBehaviourComponent) {
                        this.steeringBehaviour = steeringBehaviourComponent.steeringBehaviour;
                    }
                    else {
                        console.error('No steeringBehaviour found!');
                    }

                },
                update: function(dTime) {
                    var rigidBodyComponent = this.entity.getComponent('rigidBody');

                    if (rigidBodyComponent && rigidBodyComponent.rigidBody) {
                        // Update rotation
                        var currentVel = rigidBodyComponent.rigidBody.getLinearVelocity().toTHREEVector3();
                        if (currentVel.lengthSq() > 0.1) {
                            this.entity.rotation.y = IbUtils.vecToEuler(currentVel) - Math.PI / 2;
                        }
                    }
                },
                destroy: function() {

                },
                handleMessage: function(message, data) {

                }
            });
        }]
    )
