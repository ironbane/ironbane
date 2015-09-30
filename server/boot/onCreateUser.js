angular
    .module('server.boot.onCreateUser', [
        'models',
        'server.boot.requiredProfileFields',
        'server.boot.adminEmailList'
    ])
    .run(["REQUIRED_PROFILE_FIELDS", "ADMIN_EMAIL_LIST", "RolesCollection", function(REQUIRED_PROFILE_FIELDS, ADMIN_EMAIL_LIST, RolesCollection) {
            'use strict';

            // Default player settings
            Accounts.onCreateUser(function(options, user) {
                // We're enforcing at least an empty profile object to avoid needing to check
                // for its existence later.
                user.profile = options.profile ? options.profile : {};

                _.extend(user.profile, REQUIRED_PROFILE_FIELDS);

                // console.log('New user ', user);

                user.emails.forEach(function (email) {
                    if (_.contains(ADMIN_EMAIL_LIST, email.address)) {
                        Meteor.setTimeout(function () {
                            console.log('Added ' + email.address + ' as game master.');
                            RolesCollection.addUsersToRoles(user._id, ['game-master']);
                        }, 1000);
                    }
                });

                return user;
            });

        }]
    );
