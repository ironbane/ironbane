angular
    .module('server.services.accounts', [
        'models'
    ])
    .run(function(EntitiesCollection) {
        'use strict';

        Meteor.methods({
            updateProfile: function(field, value) {

                var allowedProfileFieldsToBeEdited = [
                    'enableSound',
                    'cameraType'
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
            },
            warnUser: function(char, warningLevel, message) {
                if (!Roles.userIsInRole(this.userId, ['game-master', 'admin'])) {
                    throw new Meteor.Error('insufficient privledges');
                }

                var character = EntitiesCollection.findOne({
                    name: char
                });

                if (!character) {
                    throw new Meteor.Error('character not found!');
                }

                var warning = {
                    level: warningLevel,
                    message: message,
                    issuedBy: this.userId,
                    issuedOn: new Date()
                };

                Meteor.users.update(character.owner, {
                    $push: {warnings: warning}
                });

                // TODO: notify user via chat message
            }
        });

        // Only let users update their profile using methods
        Meteor.users.deny({
            update: function() {
                return true;
            }
        });

    });
