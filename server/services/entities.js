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
                    var allowedFields = ['position', 'rotation'];

                    var containsInvalidFields = false;
                    fields.forEach(function(field) {
                        if (!_.contains(allowedFields, field)) {
                            containsInvalidFields = true;
                        }
                    });

                    return entity.active && entity.owner === userId && !containsInvalidFields;
                },
                remove: function(userId, entity) {
                    return entity.owner === userId;
                }
            });

            Meteor.publish('entities', function() {
                return EntitiesCollection.find({});
            });
        }
    ])
    .run([
        'EntitiesCollection',
        'ChatService',
        function(EntitiesCollection, ChatService) {
            'use strict';

            Meteor.users.find({
                'status.online': true
            }).observe({
                added: function(user) {
                    // user just came online
                },
                removed: function(user) {
                    // user just went offline
                    EntitiesCollection.update({
                        owner: user._id
                    }, {
                        $set: {
                            active: false
                        }
                    }, {
                        multi: true
                    });
                }
            });

            EntitiesCollection.find({
                active: true,
                owner: {
                    $exists: true
                }
            }).observe({
                added: function(character) {
                    ChatService.announce(character.name + ' has entered the world.', {
                        join: true
                    });
                },
                removed: function(character) {
                    ChatService.announce(character.name + ' has left the world.', {
                        leave: true
                    });
                }
            });
        }
    ]);
