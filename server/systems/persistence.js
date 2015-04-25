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
                    this.timer = new Timer(60);
                },
                update: function() {
                    if (this.timer.isExpired) {
                        var entsToPersist = this.world.getEntities('persisted');
                        entsToPersist.forEach(function(entity) {
                            var persist = entity.getComponent('persisted'),
                                serializedPosition = entity.position.serialize(),
                                serializedRotation = entity.rotation.serialize();

                            EntitiesCollection.update({
                                _id: persist._id
                            }, {
                                $set: {
                                    position: serializedPosition,
                                    rotation: serializedRotation
                                }
                            });
                            // TODO: serialize component data
                        });

                        this.timer.reset();
                    }
                }
            });

            return PersistSystem;
        }
    ]);
