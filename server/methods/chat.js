/*global Collections:true, check: true*/
'use strict';

Meteor.methods({
    chatAnnounce: function(msg) {
        check(msg, String);

        // TODO: some other check that the client should be able to post an announcment!

        Collections.ChatMessages.insert({
            room: 'global',
            ts: new Date(),
            msg: msg,
            system: true
        });
    }
});
