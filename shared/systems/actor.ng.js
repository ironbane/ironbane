angular
    .module('systems.actor', [
        'ces',
        'game.ai.states'
    ])
    .factory('ActorSystem', function($log, System, States) {
            'use strict';

            var stateNames = ['localState', 'globalState']

            return System.extend({
                addedToWorld: function(world) {
                    this._super(world);

                    stateNames.forEach(function (stateName) {
                        world.entityAdded(stateName).add(function(entity) {
                            var stateComponent = entity.getComponent(stateName);
                            stateComponent.state = new States.get(stateComponent.stateName, entity);
                        });
                        world.entityRemoved(stateName).add(function(entity) {
                            var stateComponent = entity.getComponent(stateName);
                            stateComponent.state.destroy();
                        });
                    })
                },
                update: function(dTime) {
                    var me = this;

                    stateNames.forEach(function (stateName) {
                        var stateEntities = me.world.getEntities(stateName);

                        stateEntities.forEach(function(entity) {
                            var stateComponent = entity.getComponent(stateName);

                            if (stateComponent) {
                                stateComponent.state.update(dTime);
                            }
                        });
                    })
                }
            });
        }
    );
