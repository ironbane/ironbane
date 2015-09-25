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
                        'profile.server': IB_CONSTANTS.realm
                    }
                });

                return ServersCollection.find({});
            });

            Meteor.setInterval(function () {

                var servers = ServersCollection.find({}).fetch();
                // console.log(servers);

                // var players = Meteor.users.find({
                //     'status.online': true
                //     // 'profile.server': server.name
                // }).fetch();
                // console.log(players);

                servers.forEach(function (server) {
                    var playersOnline = Meteor.users.find({
                        'status.online': true,
                        'profile.server': server.name
                    }).count();

                    ServersCollection.update(server._id, {
                        $set: {
                            playersOnline: playersOnline
                        }
                    })
                });


            }, 10000);
        }
    ])