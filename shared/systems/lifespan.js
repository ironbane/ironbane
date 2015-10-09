angular
    .module('systems.lifespan', [
        'ces.entityProcessingSystem',
        'engine.timing'
    ])
    .factory('LifeSpanSystem', [
        'EntityProcessingSystem',
        'Timer',
        function(EntityProcessingSystem, Timer) {
            'use strict';

            var LifeSpanSystem = EntityProcessingSystem.extend({
                init: function() {
                    this._super('lifespan');
                },
                onEntityAdded: function(entity) {
                    var lifespan = entity.getComponent('lifespan');
                    lifespan._timer = new Timer(lifespan.duration);
                },
                updateEntity: function(timing, entity) {
                    var lifespan = entity.getComponent('lifespan');

                    if (lifespan._timer.isExpired) {
                        if (entity.hasComponent('netSend')) {
                            if (Meteor.isServer) {
                                this.world.removeEntity(entity);
                            }
                        } else {
                            this.world.removeEntity(entity);
                        }
                    }
                }
            });

            return LifeSpanSystem;
        }
    ]);
