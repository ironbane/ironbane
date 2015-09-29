angular
    .module('server.boot.periodicStats', [
        'global.constants',
        'models.stats',
        'server.services.hipchat'
    ])
    .run(function(IB_CONSTANTS, StatsCollection, HipChat) {
        'use strict';

        function notifyUserStats(prefix) {
            var messages = [];

            if (prefix) {
                messages.push(prefix);
            }

            var counts = {
                guests: 0,
                user: 0,
                gm: 0,
                total: 0
            };

            Meteor.users.find({
                'status.online': true
            }).forEach(function(user) {
                if (user.profile.guest) {
                    counts.guests++;
                } else if (Roles.userIsInRole(user.userId, ['game-master'])) {
                    counts.gm++;
                } else {
                    counts.user++;
                }

                counts.total++;
            });

            messages.push('Players online [' + counts.total + ']: users(' + counts.user + ') guests(' + counts.guests + ') gm(' + counts.gm + ')');

            messages.push('Registered players: ' + Meteor.users.find({
                'profile.guest': {
                    $exists: false
                }
            }).count());

            var message = messages.join(' | ');
            console.log(message);
            HipChat.postMessage('Ironbane Chillout', message);
        }

        Meteor.methods({
            onlineStats: function(prefixMessage) {
                // this can force it to happen outside of the normal schedule
                if (!this.userId || !Roles.userIsInRole(this.userId, ['game-master'])) {
                    throw new Meteor.Error('not-authorized');
                }

                notifyUserStats(prefixMessage);
            }
        });

        if (!IB_CONSTANTS.isDev) {
            Meteor.setTimeout(function() {
                if (!IB_CONSTANTS.isDev) {
                    HipChat.postMessage('Ironbane Chillout', 'Production server started!');
                }
            }, 30 * 1000);

            Meteor.setInterval(notifyUserStats, 3600 * 3 * 1000);
        }
    });
