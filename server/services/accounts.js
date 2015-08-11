angular
    .module('server.services.accounts', [
        'models'
    ])
    .run(function() {
        'use strict';

        Meteor.methods({
            updateProfile: function (field, value) {

                var allowedProfileFieldsToBeEdited = [
                    'enableSound'
                ];

                if (!_.contains(allowedProfileFieldsToBeEdited, field)) {
                    console.log('Profile update denied: ' + field);
                    return;
                }

                if (this.userId) {
                    var fieldsToUpdate = {};
                    fieldsToUpdate['profile.' + field] = value;
                    Meteor.users.update(this.userId, {
                        $set: fieldsToUpdate
                    });
                }
            }
        });

        // Only let users update their profile using methods
        Meteor.users.deny({
            update: function() {
                return true;
            }
        });

    });
