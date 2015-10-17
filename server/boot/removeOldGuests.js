angular
    .module('server.boot.removeOldGuests', [
        'models'
    ])
    .run([
        'AccountsCollection',
        'EntitiesCollection',
        function(AccountsCollection, EntitiesCollection) {
            'use strict';

            var clear = function () {
                // Clean out all guest accounts more than 1 hour old
                var before = new Date();
                before.setHours(before.getHours() - 1);
                Accounts.removeOldGuests(before);

                // Remove entities that belong to guests and are no longer there
                var entities = EntitiesCollection.find({});
                entities.forEach(function(row) {
                    var user = Meteor.users.findOne(row.owner);

                    if (!user || (user.profile.guest && !user.status.online)) {
                        EntitiesCollection.remove(row._id);
                    }
                });
            };

            Meteor.startup(clear);
            Meteor.setInterval(clear, 3600 * 1000);

        }
    ]);
