/*global Collections:true, check: true*/
'use strict';

Meteor.methods({
    chatAnnounce: function(msg, flags) {
        check(msg, String);

        flags = flags || {};

        // TODO: some other check that the client should be able to post an announcment!

        _.extend(flags, {
            system: true,
            announcement: true
        });

        Collections.ChatMessages.insert({
            room: 'global',
            ts: new Date(),
            msg: msg,
            flags: flags
        });
    }
});
