angular
    .module('server.systems.autoAnnounceSystem', [
        'ces.system',
        'engine.util',
        'global.constants',
        'models',
        'engine.timing'
    ])
    .factory('AutoAnnounceSystem', [
        'System',
        'IbUtils',
        'IB_CONSTANTS',
        'EntitiesCollection',
        'Timer',
        '$timing',
        function(System, IbUtils, IB_CONSTANTS, EntitiesCollection, Timer, $timing) {
            'use strict';

            var AutoAnnounceSystem = System.extend({
                init: function() {
                    this.announceTimer = new Timer(IB_CONSTANTS.serverAnnouncementsTimeout);
                },
                update: function() {
                    if (this.announceTimer.isExpired) {
                        // Make sure there are players online so we don't talk to a wall
                        if (EntitiesCollection.find({
                                active: true,
                                owner: {
                                    $exists: true
                                }
                            }).count() > 0) {

                            var messages = IbUtils.chooseFromSequence([

                                // Actually these shouldn't be done using arrays, I just don't know how to insert raw html (<br>)
                                // and have angular not filter these out.
                                // Would be cool though to have links etc to twitter and our homepage

                                [
                                    'Welcome to Ironbane ' + IB_CONSTANTS.GAME_VERSION + '!',
                                    'Server uptime: ' + IbUtils.timeSince($timing.startTime)
                                ],

                                [
                                    'Note that Ironbane is in pre-alpha stage.',
                                    'Please report all bugs in the forum.'
                                ],

                                // TODO implement /stuck
                                // 'Are you stuck? Type /stuck to be teleported back to town.',

                                [
                                    'Did you know Ironbane has a newsletter?',
                                    'Simply go to our homepage to sign up.'
                                ],

                                [
                                    'Follow us on Twitter! @IronbaneMMO'
                                ],

                                // Not sure if we should still add IRC
                                // 'Join us on IRC! #ironbane on chat.freenode.net',

                            ]);

                            messages.forEach(function(msg) {
                                Meteor.call('chatAnnounce', msg, {
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
