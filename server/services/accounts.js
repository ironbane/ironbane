angular
    .module('server.services.accounts', [
        'models',
        'global.constants'
    ])
    .run([
        'IB_CONSTANTS',
        'AccountsCollection',
        'RolesCollection',
        function(IB_CONSTANTS, AccountsCollection, RolesCollection) {
            'use strict';

            Meteor.setInterval(function() {
                /* clean out all guest accounts more than 1 hour old */
                var before = new Date();
                before.setHours(before.getHours() - 1);
                AccountsCollection.removeOldGuests(before);
            }, 3600 * 1000);

            if (IB_CONSTANTS.isDev) {
                if (Meteor.users.find({}).count() === 0) {
                    var userId = AccountsCollection.createUser({
                        username: 'admin',
                        password: 'admin'
                    });

                    RolesCollection.addUsersToRoles(userId, ['game-master']);
                }
            }
        }
    ]);
