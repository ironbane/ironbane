/*global Collections:true*/
'use strict';

Meteor.startup(function() {

    Collections.ChatMessages.deny({
        insert: function(userId, doc) {
            return (userId === null);
        },
        update: function(userId, doc, fieldNames, modifier) {
            return true;
        },
        remove: function(userId, doc) {
            return true;
        }
    });

    Collections.ChatMessages.allow({
        insert: function(userId, doc) {
            return (userId !== null);
        }
    });

});
