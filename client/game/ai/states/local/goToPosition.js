angular
    .module('game.ai.states.local')
    .factory('GoToPosition', ["Class", "THREE", "IbUtils", "BaseState", function(Class, THREE, IbUtils, BaseState) {
            'use strict';

            return BaseState.extend({
                init: function(entity, config, world) {
                    this._super.apply(this, arguments);
                },
                update: function(dTime) {
                    this._super.apply(this, arguments);

                    if (this.entity.position.distanceToSquared(this.targetPosition) > 0.2 * 0.2) {
                        this.steeringBehaviour.seek(this.targetPosition);
                    }
                    else {
                        this.steeringBehaviour.brake(1.0);
                    }

                    // this.steeringBehaviour.arrive(this.targetPosition);
                },
                destroy: function() {

                },
                handleMessage: function(message, data) {

                }
            });
        }]
    )