angular
    .module('server.boot.periodicStats', [
        'global.constants',
        'models.stats',
        'server.services.hipchat'
    ])
    .run(function(IB_CONSTANTS, StatsCollection, HipChat) {
            'use strict';

            Meteor.setTimeout(function () {
                if (!IB_CONSTANTS.isDev) {
                    HipChat.postMessage('Ironbane Chillout', 'Production server started!');
                }
            }, 30 * 1000);

            Meteor.setInterval(function () {
                if (!IB_CONSTANTS.isDev) {
                    var messages = [];

                    messages.push('Players online: ' + Meteor.users.find({
                        'status.online': true
                    }).count());

                    messages.push('Registered players: ' + Meteor.users.find({
                        'profile.guest': {
                            $exists: false
                        }
                    }).count())

                    var message = messages.join(' | ');
                    console.log(message);
                    HipChat.postMessage('Ironbane Chillout', message);
                }
            }, 3600 * 3 * 1000);
        }
    );
