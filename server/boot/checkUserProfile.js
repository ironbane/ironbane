angular
    .module('server.boot.checkUserProfile', [
    ])
    .run(function() {
            'use strict';

            var users = Meteor.users.find({
                profile: {
                    $exists: false
                }
            }).fetch();

            _.each(users, function (user) {
                Meteor.users.update(user._id, {
                    $set: {
                        profile: {}
                    }
                });
            });
        }
    );
