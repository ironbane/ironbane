angular
    .module('systems.actor', [
        'ces',
        'game.ai.states'
    ])
    .factory('ActorSystem', ["$log", "System", "States", function($log, System, States) {
        'use strict';

        var stateNames = [Meteor.isClient ? 'localState' : 'globalState'];

        return System.extend({
            addedToWorld: function(world) {
                this._super(world);

                stateNames.forEach(function(stateName) {
                    world.entityAdded(stateName).add(function(entity) {
                        var stateComponent = entity.getComponent(stateName);
                        stateComponent._state = new States.get(stateComponent.state, entity, stateComponent.config, world);
                    });

                    world.entityRemoved(stateName).add(function(entity) {
                        var stateComponent = entity.getComponent(stateName);
                        if (stateComponent._state) {
                            // TODO: if this doesn't happen, there some race condition?
                            stateComponent._state.destroy();
                        }
                    });
                });
            },
            update: function(dTime) {
                var me = this;

                stateNames.forEach(function(stateName) {
                    var stateEntities = me.world.getEntities(stateName);

                    stateEntities.forEach(function(entity) {
                        var stateComponent = entity.getComponent(stateName);

                        if (stateComponent && stateComponent._state) {
                            stateComponent._state.update(dTime);
                        }
                    });
                });
            }
        });
    }]);
