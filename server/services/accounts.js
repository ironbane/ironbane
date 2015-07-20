angular
    .module('server.services.accounts', [
        'models'
    ])
    .run([
        'AccountsCollection',
        function(AccountsCollection) {
            'use strict';

            Meteor.setInterval(function() {
                /* clean out all guest accounts more than 1 hour old */
                var before = new Date();
                before.setHours(before.getHours() - 1);
                AccountsCollection.removeOldGuests(before);
            }, 3600 * 1000);

            // Default player settings
            Accounts.onCreateUser(function(options, user) {

                // We're enforcing at least an empty profile object to avoid needing to check
                // for its existence later.
                user.profile = options.profile ? options.profile : {};

                user.profile.enableSound = true;

                return user;
            });           

            Meteor.methods({
                updateProfile: function (field, value) {
                    if (this.userId) {
                        var fieldsToUpdate = {};
                        fieldsToUpdate['profile.' + field] = value;
                        Meteor.users.update(this.userId, {
                            $set: fieldsToUpdate
                        });
                    }
                }
            }) 

        }
    ]);
