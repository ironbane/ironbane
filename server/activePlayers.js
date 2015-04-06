'use strict';

Meteor.users.find({
    'status.online': true
}).observe({
    added: function(user) {
        // user just came online
    },
    removed: function(user) {
        // user just went offline
        Entities.update({
            owner: user._id
        }, {
            $set: {
                active: false
            }
        }, {
            multi: true
        });
    }
});

Entities.find({
    active: true,
    owner: {$exists: true}
}).observe({
    added: function(character) {
        Meteor.call('chatAnnounce', character.name + ' has entered the world.', {join: true});
    },
    removed: function(character) {
        Meteor.call('chatAnnounce', character.name + ' has left the world.', {leave: true});
    }
});
