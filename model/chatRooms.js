(function(global) {
    'use strict';

    global.ChatRooms = new global.Mongo.Collection('chatRooms');

    if (Meteor.isServer) {

        global.ChatRooms.deny({
            insert: function(userId, doc) {
                return true;
            },
            update: function(userId, doc, fieldNames, modifier) {
                return true;
            },
            remove: function(userId, doc) {
                return true;
            }
        });

        Meteor.publish('chatRooms', function() {
            return global.ChatRooms.find();
        });
    }

})(this);
