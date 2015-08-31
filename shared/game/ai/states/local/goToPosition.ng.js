angular
    .module('game.ai.states.local')
    .factory('GoToPosition', function(Class, THREE, IbUtils, BaseState) {
            'use strict';

            return BaseState.extend({
                init: function(entity, config, world) {
                    this._super.apply(this, arguments);
                },
                update: function(dTime) {
                    this._super.apply(this, arguments);

                    this.steeringBehaviour.arrive(this.targetPosition);
                },
                destroy: function() {

                },
                handleMessage: function(message, data) {

                }
            });
        }
    )