/*global Collections:true*/
'use strict';

Meteor.startup(function() {

    Collections.ChatRooms.deny({
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

});
