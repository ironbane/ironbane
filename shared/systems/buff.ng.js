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
                                var health = entity.getComponent('health');

                                if (health.value < health.max) {
                                    health.value += buffComponent.amountPerInterval;
                                    if (health.value > health.max) {
                                        health.value = health.max;
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
