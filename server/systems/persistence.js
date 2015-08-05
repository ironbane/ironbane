angular
    .module('server.systems.persistence', [
        'ces',
        'models',
        'engine.timing'
    ])
    .factory('PersistenceSystem', [
        'System',
        'EntitiesCollection',
        'Timer',
        function(System, EntitiesCollection, Timer) {
            'use strict';

            var PersistSystem = System.extend({
                init: function() {
                    this.timer = new Timer(20);
                },
                update: function() {
                    if (this.timer.isExpired) {
                        var entsToPersist = this.world.getEntities('persisted');
                        entsToPersist.forEach(function(entity) {
                            var persist = entity.getComponent('persisted'),
                                entityState = entity.toJSON();

                            entityState.position = entity.position.serialize();
                            entityState.rotation = entity.rotation.serialize();

                            EntitiesCollection.update({
                                _id: persist._id
                            }, {
                                $set: entityState
                            });
                        });

                        this.timer.reset();
                    }
                }
            });

            return PersistSystem;
        }
    ]);
