angular
    .module('server.services.entities', [
        'models',
        'server.services.chat'
    ])
    .run([
        'EntitiesCollection',
        function(EntitiesCollection) {
            'use strict';

            EntitiesCollection.allow({
                insert: function(userId, entity) {
                    return false;
                },
                update: function(userId, entity, fields, modifier) {
                    return false;
                },
                remove: function(userId, entity) {
                    return entity.owner === userId;
                }
            });

            Meteor.publish('entities', function() {
                return EntitiesCollection.find({
                    owner: this.userId
                });
            });
        }
    ])