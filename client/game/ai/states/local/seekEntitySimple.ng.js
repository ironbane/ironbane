angular
    .module('game.ai.states.local')
    .factory('SeekEntitySimple', function(Class, THREE, IbUtils, Patrol, BaseState, $rootWorld, Debugger) {
            'use strict';

            return BaseState.extend({
                init: function(entity, config, world) {
                    this._super.apply(this, arguments);
                },
                update: function(dTime) {
                    this._super.apply(this, arguments);

                    if (!this.targetEntity) {
                        this.targetEntity = this.world.scene.getObjectByProperty('uuid', this.targetEntityUuid);;
                    }
                    else if (this.entity.position.distanceToSquared(this.targetEntity.position) > 1.2 * 1.2) {
                        this.steeringBehaviour.arrive(this.targetEntity.position);
                    }
                    else {
                        // Stop!
                        this.steeringBehaviour.brake(1.0);
                    }
                },
                handleMessage: function(message, data) {

                }
            });
        }
    )
