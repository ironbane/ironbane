angular
    .module('server.services.servers', [
        'models',
        'global.constants.game'
    ])
    .run([
        'ServersCollection',
        'IB_CONSTANTS',
        function(ServersCollection, IB_CONSTANTS) {
            'use strict';

            Meteor.publish('servers', function() {

                Meteor.users.update(this.userId, {
                    $set: {
                        'profile.server': {
                            id: Meteor.settings.server.id,
                            name: Meteor.settings.server.name
                        }
                    }
                });

                return ServersCollection.find({
                    lastUpdate: {
                        $gt: (new Date().getTime()) - 10
                    }
                });
            });

            Meteor.setInterval(function () {

                var playersOnline = Meteor.users.find({
                    'status.online': true,
                    'profile.server.id': Meteor.settings.server.id
                }).count();

                ServersCollection.upsert({
                    'id': Meteor.settings.server.id
                }, {
                    $set: {
                        name: Meteor.settings.server.name,
                        capacity: Meteor.settings.server.capacity,
                        playersOnline: playersOnline,
                        lastUpdate: new Date().getTime()
                    }
                })

            }, 3000);
        }
    ])