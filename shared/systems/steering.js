angular
    .module('systems.steering', [
        'ces',
        'game.ai.states',
        'game.steeringBehaviour'
    ])
    .factory('SteeringSystem', ["$log", "System", "States", "SteeringBehaviour", function($log, System, States, SteeringBehaviour) {
            'use strict';


            return System.extend({
                addedToWorld: function(world) {
                    this._super(world);

                    world.entityAdded('steeringBehaviour').add(function(entity) {
                        var steeringBehaviourComponent = entity.getComponent('steeringBehaviour');
                        steeringBehaviourComponent.steeringBehaviour = new SteeringBehaviour(entity);
                    });
                },
                update: function(dTime) {
                    var me = this;

                    var steeringBehaviourEntities = me.world.getEntities('steeringBehaviour');

                    steeringBehaviourEntities.forEach(function(entity) {
                        var steeringBehaviourComponent = entity.getComponent('steeringBehaviour');

                        if (steeringBehaviourComponent) {
                            steeringBehaviourComponent.steeringBehaviour.update(dTime);
                        }
                    });

                }
            });
        }]
    );
