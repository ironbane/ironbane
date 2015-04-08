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

            if (doc.msg.length <= 0) {
                return false;
            }

            doc.msg = doc.msg.substr(0, 255);

            doc.ts = new Date();

            // TODO do checks for character name, pos, level etc

            return (userId !== null);
        }
    });

});
