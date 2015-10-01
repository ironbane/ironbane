angular
    .module('server.services.accounts', [
        'models',
        'server.services.character'
    ])
    .run(function(CharacterService, ChatService) {
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
            warnUser: function(charName, warningLevel, message) {
                if (!Roles.userIsInRole(this.userId, ['game-master', 'admin'])) {
                    throw new Meteor.Error('insufficient privledges');
                }

                var character = CharacterService.getCharacterByName(charName);

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

                var offender = Meteor.users.findOne({_id: character.owner});

                // TODO: notify user via chat message
                ChatService.directMessage('system', character.owner, message, {warn: true, warnings: offender.warnings.length});
            }
        });

        // Only let users update their profile using methods
        Meteor.users.deny({
            update: function() {
                return true;
            }
        });

    });
