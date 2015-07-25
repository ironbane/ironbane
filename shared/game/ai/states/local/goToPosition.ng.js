angular
    .module('game.ai.states.local')
    .factory('GoToPosition', function(Class, THREE, IbUtils) {
            'use strict';

            return Class.extend({
                init: function(entity, data) {
                    this.entity = entity;

                    _.extend(this, data);
                },
                update: function(dTime) {
                    var steeringBehaviourComponent = this.entity.getComponent('steeringBehaviour');
                    if (steeringBehaviourComponent) {
                        var steeringBehaviour = steeringBehaviourComponent.steeringBehaviour;
                        steeringBehaviour.arrive(this.targetPosition);
                    }

                    var rigidBodyComponent = this.entity.getComponent('rigidBody');
                    if (rigidBodyComponent) {
                        var rigidBody = rigidBodyComponent.rigidBody;

                        var currentVel = rigidBody.getLinearVelocity().toTHREEVector3();
                        this.entity.rotation.y = IbUtils.vecToEuler(currentVel) - Math.PI / 2;
                    }
                },
                destroy: function() {

                },
                handleMessage: function(message, data) {

                }
            });
        }
    )
