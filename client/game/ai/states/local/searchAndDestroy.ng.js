angular
    .module('game.ai.states.local')
    .factory('SearchAndDestroyEntity', function(Class, THREE, IbUtils, Patrol, SeekEntity, $rootWorld) {
            'use strict';

            return SeekEntity.extend({
                init: function(entity, config, world) {
                    this._super.apply(this, arguments);
                },
                update: function(dTime) {
                    this._super.apply(this, arguments);

                    var fighterComponent = this.entity.getComponent('fighter');

                    if (fighterComponent) {
                        if (this.targetEntity) {
                            var toTarget = this.targetEntity.position.clone().sub(this.entity.position);

                            if (toTarget.lengthSq() > fighterComponent.attackRange * fighterComponent.attackRange) {
                                toTarget.normalize().multiplyScalar(fighterComponent.attackRange);
                            }

                            var targetVector = this.entity.position.clone().add(toTarget);

                            fighterComponent.attack(targetVector);
                        }
                    }

                },
                destroy: function() {
                    this._super.apply(this, arguments);
                },
                handleMessage: function(message, data) {

                }
            });
        }
    )
