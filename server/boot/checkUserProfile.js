angular
    .module('server.boot.checkUserProfile', [
        'server.boot.requiredProfileFields'
    ])
    .run(function(REQUIRED_PROFILE_FIELDS) {
            'use strict';

            var checkUserProfiles = function () {
                Meteor.users.update({
                    profile: {
                        $exists: false
                    }
                }, {
                    $set: {
                        profile: {}
                    }
                }, {
                    multi: true
                });

                _.each(REQUIRED_PROFILE_FIELDS, function (val, key) {
                    var updateSelector = {};
                    updateSelector['profile.' + key] = {
                        $exists: false
                    };
                    var update = {};
                    update['profile.' + key] = val;
                    Meteor.users.update(updateSelector, {
                        $set: update
                    }, {
                        multi: true
                    });
                });

                console.log('Checked user profiles.');
            };

            Meteor.startup(checkUserProfiles);
        }
    );
