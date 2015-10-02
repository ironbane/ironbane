var me = this;
angular
    .module('server.services.inspect', [
        'server.services.activeWorlds',
        'game.world-root',
    ])
    .run(function ($rootWorld, $activeWorlds) {
        'use strict';

        me.$rootWorld = $rootWorld;
        me.$activeWorlds = $activeWorlds;

        Meteor.methods({
            inspect: function (body) {
                if (!this.userId || !Roles.userIsInRole(this.userId, ['game-master'])) {
                    throw new Meteor.Error('not-authorized');
                }

                if (!body) {
                    return;
                }

                console.log('inspect body:', body);
                var result;
                try {
                    var fn = new Function('return ' + body); // jshint ignore:line
                    result = fn();
                } catch(e) {
                    console.log('eval-error', e);
                    return 'Error: ' + e.message;
                    // throw e;
                }

                console.log('inspect result:', result);
                return result;
            }
        });

    });