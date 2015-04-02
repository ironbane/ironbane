/*global Collections:true*/
'use strict';

Collections.ChatMessages = new Mongo.Collection('chatMessages');

if (Meteor.isServer) {
    Meteor.publish('chatMessages', function() {
        return Collections.ChatMessages.find({}, {
            sort: {
                ts: -1
            }
        });
    });
}
