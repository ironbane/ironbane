angular
    .module('server.services.hipchat', [])
    .service('HipChat', function() {
        'use strict';

        if (Meteor.settings.server.hipchat.apiKey) {
            var hipchat = Meteor.npmRequire('node-hipchat');

            var HC = new hipchat(Meteor.settings.server.hipchat.apiKey);

            var rooms = null;

            HC.listRooms(function(data) {
                rooms = data.rooms;
            });
        }

        this.postMessage = function(roomName, msg) {
            if (Meteor.settings.server.hipchat.apiKey) {
                var room = _.findWhere(rooms, {
                    name: roomName
                });

                if (room) {
                    var params = {
                        room: room.room_id,
                        from: 'Ironbot',
                        message: msg,
                        color: 'green'
                    };

                    HC.postMessage(params, function(data) {

                    });
                }
            }
        };

    });