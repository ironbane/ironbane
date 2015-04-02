/*global Collections:true*/
'use strict';

Meteor.startup(function () {
    Collections.ChatRooms.remove({});

    Collections.ChatRooms.insert({
        roomname: 'global'
    });
});
