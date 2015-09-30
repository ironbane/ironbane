angular
    .module('server.boot.createAdmins', [
        'models',
        'global.constants',
        'server.services.character',
        'server.boot.adminEmailList'
    ])
    .run(["IB_CONSTANTS", "AccountsCollection", "RolesCollection", "CharacterService", "InventoryCollection", "ADMIN_EMAIL_LIST", function(IB_CONSTANTS, AccountsCollection, RolesCollection, CharacterService, InventoryCollection, ADMIN_EMAIL_LIST) {
            'use strict';

            if (IB_CONSTANTS.isDev) {
                // Create a default user and character
                if (Meteor.users.find({
                    username: 'admin'
                }).count() === 0) {
                    var userId = AccountsCollection.createUser({
                        username: 'admin',
                        password: 'admin'
                    });

                    RolesCollection.addUsersToRoles(userId, ['game-master']);
                }
            }

            // Set the team to be admins
            ADMIN_EMAIL_LIST.forEach(function (email) {
                var userId = Meteor.users.findOne({
                    'emails.address': email
                });

                if (userId) {
                    console.log('Added ' + email + ' as game master.');
                    RolesCollection.addUsersToRoles(userId, ['game-master']);
                }
            });
        }]
    );
