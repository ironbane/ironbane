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
        '$log',
        function(System, EntitiesCollection, Timer, $log) {
            'use strict';

            var persist =  Meteor.bindEnvironment(function (entity) {
                var persist = entity.getComponent('persisted'),
                    entityState = entity.toJSON();

                entityState.position = entity.position.serialize();
                entityState.rotation = entity.rotation.serialize();

                //$log.debug('persist: ', entityState);

                EntitiesCollection.update({
                    _id: persist._id
                }, {
                    $set: entityState
                });
            });

            var PersistSystem = System.extend({
                init: function() {
                    this.timer = new Timer(20);
                },
                addedToWorld: function(world) {
                    this._super(world);

                    world.singleEntityRemoved.add(function (entity) {
                        if (entity.getComponent('persisted')) {
                            persist(entity);
                        }
                    });

                },
                update: function() {
                    if (this.timer.isExpired) {
                        var entsToPersist = this.world.getEntities('persisted');
                        entsToPersist.forEach(persist);

                        this.timer.reset();
                    }
                }
            });

            return PersistSystem;
        }
    ]);
