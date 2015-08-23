angular
    .module('server.services.hipchat', [])
    .service('HipChat', function() {
        'use strict';

        var hipchat = Meteor.npmRequire('node-hipchat');

        var HC = new hipchat('817d6f5dbb025e4f0b485aca5733d5');

        var rooms = null;

        HC.listRooms(function(data) {
            rooms = data.rooms;
        });

        this.postMessage = function(roomName, msg) {
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
        };

    });