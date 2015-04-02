/*global Collections:true*/
'use strict';

Collections.ChatRooms = new Mongo.Collection('chatRooms');

if (Meteor.isServer) {
    Meteor.publish('chatRooms', function() {
        return Collections.ChatRooms.find();
    });
}
