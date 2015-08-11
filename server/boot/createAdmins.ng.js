angular
    .module('server.boot.createAdmins', [
        'models',
        'global.constants',
        'server.services.character'
    ])
    .run(function(IB_CONSTANTS, AccountsCollection, RolesCollection, ZonesCollection, CharacterService, InventoryCollection) {
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
            var adminEmails = [
                'bsparks42@gmail.com',
                'Profils96@web.de',
                'ilovemusic628496@gmail.com',
                'thaiberius.code@gmail.com',
                'ayillon@gmail.com',
                'nikke@ironbane.com',
                'arthasthelichking@sbcglobal.net'
            ];

            adminEmails.forEach(function (email) {
                var userId = Meteor.users.findOne({
                    'emails.address': email
                });

                if (userId) {
                    console.log('Added ' + email + ' as game master.');
                    RolesCollection.addUsersToRoles(userId, ['game-master']);
                }
            });
        }
    );
