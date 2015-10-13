angular
    .module('server.systems.autoAnnounceSystem', [
        'ces.system',
        'engine.util',
        'global.constants',
        'server.services.activeWorlds',
        'models',
        'engine.timing'
    ])
    .factory('AutoAnnounceSystem', [
        'System',
        'IbUtils',
        'IB_CONSTANTS',
        'Timer',
        '$timing',
        '$activeWorlds',
        function(System, IbUtils, IB_CONSTANTS, Timer, $timing, $activeWorlds) {
            'use strict';

            var AutoAnnounceSystem = System.extend({
                init: function() {
                    this.announceTimer = new Timer(IB_CONSTANTS.serverAnnouncementsTimeout);
                },
                update: function() {
                    if (this.announceTimer.isExpired) {
                        // Make sure there are players online so we don't talk to a wall

                        var canPost = false;
                        _.each($activeWorlds, function (world) {
                            var playerEntities = world.getEntities('player');
                            if (playerEntities.length > 0) {
                                canPost = true;
                            }
                        });

                        if (canPost) {
                            var messages = IbUtils.chooseFromSequence([

                                // Actually these shouldn't be done using arrays, I just don't know how to insert raw html (<br>)
                                // and have angular not filter these out.
                                // Would be cool though to have links etc to twitter and our homepage

                                [
                                    'Welcome to Ironbane ' + IB_CONSTANTS.GAME_VERSION + '!',
                                    'Server uptime: ' + IbUtils.timeSince($timing.startTime)
                                ],

                                [
                                    'Note that Ironbane is in alpha stage.',
                                    'Please report all bugs on the forum.'
                                ],

                                // TODO implement /stuck
                                [
                                    'Are you stuck? Use the Home button on the right side to teleport home.',
                                    'Try /help in the chat for more.'
                                ],

                                [
                                    'Did you know Ironbane has a newsletter?',
                                    'Simply go to our homepage to sign up.'
                                ],

                                [
                                    'Follow us on Twitter! @IronbaneMMO'
                                ],

                                // Not sure if we should still add IRC
                                // 'Join us on IRC! #ironbane on chat.freenode.net',

                            ], 'announceMessages');

                            messages.forEach(function(msg) {
                                Meteor.call('chatAnnounce', msg, {
                                    // room: world.name,
                                    server: true
                                });
                            });
                        }

                        this.announceTimer.reset();
                    }
                }
            });

            return AutoAnnounceSystem;
        }
    ]);
