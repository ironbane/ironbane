angular
    .module('systems.buff', [
        'ces'
    ])
    .factory('BuffSystem', function($log, System) {
            'use strict';

            return System.extend({
                addedToWorld: function(world) {
                    this._super(world);

                    world.entityAdded('buff').add(function(entity) {
                        var buffComponent = entity.getComponent('buff');


                        buffComponent.timer = buffComponent.interval;

                        console.log('buff added!');

                    });
                },
                update: function(dTime) {
                    var entities = this.world.getEntities('buff');

                    entities.forEach(function(entity) {
                        var buffComponent = entity.getComponent('buff');

                        console.log('buff timer', buffComponent.timer);

                        if (buffComponent.timer > 0) {
                            buffComponent.timer -= dTime;
                        }
                        else {
                            buffComponent.timer = buffComponent.interval;

                            if (buffComponent.type === 'heal') {
                                var healthComponent = entity.getComponent('health');

                                if (healthComponent) {
                                    if (healthComponent.value < healthComponent.max) {
                                        healthComponent.value += buffComponent.amountPerInterval;
                                        if (healthComponent.value > healthComponent.max) {
                                            healthComponent.value = healthComponent.max;
                                        }
                                    }
                                }
                            }

                            buffComponent.duration -= buffComponent.interval;

                            if (buffComponent.duration < 0) {
                                entity.removeComponent('buff');
                            }
                        }

                    });
                }
            });
        }
    );
