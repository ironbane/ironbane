angular
    .module('game.ai.states.local')
    .factory('FindPathToPosition', function(Class, THREE, Patrol, BaseState, $rootWorld) {
            'use strict';

            return BaseState.extend({
                init: function(entity, config, world) {
                    this._super.apply(this, arguments);

                    this.calculatedPath = Patrol.findPath(entity.position.clone().add(new THREE.Vector3(0, -0.5, 0)),
                        this.targetPosition, this.entity.level, this.navMeshGroup);
                },
                update: function(dTime) {
                    this._super.apply(this, arguments);

                    var steeringBehaviourComponent = this.entity.getComponent('steeringBehaviour');

                    if (this.calculatedPath && this.calculatedPath.length > 1) {
                        if (this.calculatedPath[0].distanceToSquared(this.entity.position) > 1 * 1) {
                            this.steeringBehaviour.seek(this.calculatedPath[0]);
                        }
                        else {
                            // Remove node from the path we calculated
                            this.calculatedPath.shift();
                        }
                    }
                    else {
                        this.steeringBehaviour.arrive(this.targetPosition);
                    }
                },
                destroy: function() {

                },
                handleMessage: function(message, data) {

                }
            });
        }
    )
