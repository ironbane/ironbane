angular
    .module('server.boot.periodicStats', [
        'global.constants',
        'models.stats',
        'server.services.hipchat'
    ])
    .run(["IB_CONSTANTS", "StatsCollection", "HipChat", function(IB_CONSTANTS, StatsCollection, HipChat) {
        'use strict';

        var alexa = Meteor.npmRequire('alexarank');

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

            messages.push('[' + Meteor.settings.server.name + '] ' + counts.total + ' players online (' + counts.guests + ' guests, ' + counts.user + ' registered, ' + counts.gm + ' GMs)');

            messages.push('Total registrations: ' + Meteor.users.find({
                'profile.guest': {
                    $exists: false
                }
            }).count());

            var message = messages.join(' | ');
            console.log(message);
            HipChat.postMessage('Ironbane Chillout', message);
        }

        function notifyAlexaRank () {
            var reportSite = function (site) {
                alexa(site, function(error, result) {
                    var message = 'Alexa rank for ' + site + ': #' + result.rank;
                    HipChat.postMessage('Ironbane Chillout', message);
                    console.log(message);
                });
            };
            reportSite('ironbane.com');
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
                HipChat.postMessage('Ironbane Chillout', Meteor.settings.server.name + ' server (' + Meteor.settings.server.id + ') started!');
            }, 5 * 1000);

            if (Meteor.settings.doPeriodicStats) {
                Meteor.setInterval(notifyUserStats, 3600 * 3 * 1000);
                Meteor.setInterval(notifyAlexaRank, 3600 * 24 * 1000);
            }
        }
        else if (process.env.VIRTUAL_HOST === 'dev.alabaster.ironbane.com') {
            Meteor.setTimeout(function() {
                HipChat.postMessage('Code', 'Dev server started!');
                HipChat.postMessage('Levels', 'Dev server started!');
            }, 5 * 1000);
        }
    }]);
