'use strict';

Meteor.startup(function () {
    ChatRooms.remove({});

    ChatRooms.insert({
        roomname: 'global',
        areaBased: false
    });

    ChatRooms.insert({
        roomname: 'local',
        areaBased: true
    });
});
