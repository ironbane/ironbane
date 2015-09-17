angular
    .module('game.ai.states.local')
    .factory('SearchAndDestroyEntity', function(Class, THREE, IbUtils, Patrol, SeekEntitySimple, $rootWorld) {
            'use strict';

            return SeekEntitySimple.extend({
                init: function(entity, config, world) {
                    this._super.apply(this, arguments);

                    var inventoryComponent = this.entity.getComponent('inventory');

                    this.attackRange = 0;

                    if (inventoryComponent.rhand && inventoryComponent.rhand.type === 'weapon') {
                        this.attackRange = inventoryComponent.rhand.range;
                    }
                    if (inventoryComponent.lhand && inventoryComponent.lhand.type === 'weapon') {
                        if (inventoryComponent.lhand.range > this.attackRange) {
                            this.attackRange = inventoryComponent.lhand.range;
                        }
                    }
                },
                update: function(dTime) {
                    this._super.apply(this, arguments);

                    var fighterComponent = this.entity.getComponent('fighter');

                    if (fighterComponent) {
                        if (this.targetEntity) {
                            var toTarget = this.targetEntity.position.clone().sub(this.entity.position);

                            if (toTarget.lengthSq() <= this.attackRange * this.attackRange) {
                                var targetVector = this.entity.position.clone().add(toTarget);

                                fighterComponent.attack(targetVector);
                            }


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
