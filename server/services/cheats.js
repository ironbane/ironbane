angular
    .module('server.services.cheats', [
        'server.services.activeWorlds',
        'game.world-root',
    ])
    .run(function ($rootWorld, $activeWorlds) {
        'use strict';

        Meteor.methods({
            updateCheats: function (cheats) {
                if (!this.userId || !Roles.userIsInRole(this.userId, ['game-master'])) {
                    throw new Meteor.Error('not-authorized');
                }

                console.log(cheats);

                // return result;
            }
        });

    });