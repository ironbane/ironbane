angular.module('game.ui.chat.chatService', [
        'angular-meteor',
        'models.chatMessages',
    ])
    .service('ChatService', [
        '$meteor',
        'ChatMessagesCollection',
        function($meteor, ChatMessagesCollection) {
            'use strict';

            var service = this;

            $meteor.subscribe('chatMessages');

            this.messages = $meteor.collection(ChatMessagesCollection);

            this.announce = function(msg) {
                return $meteor.call('chatAnnounce', msg);
            };

            this.postClientMsg = function(msg, flags) {
                flags = angular.extend({}, flags, {local: true});

                service.messages.save({
                    room: 'global',
                    ts: new Date(),
                    msg: msg,
                    flags: flags,
                    user: {
                        userId: Meteor.userId()
                    }
                });
            };

            this.parseCommand = function parseCommand(msg) {
                if (!msg) {
                    return;
                }

                var parsed;

                if (msg[0] === '/') {
                    parsed = msg.replace(/\s+/, '\x01').split('\x01');

                    var cmd = parsed[0].substr(1);
                    var args = ((parsed.length > 1) ? parsed[1] : '');

                    // just an echo
                    service.postClientMsg('command: ' + cmd + ' (' + args + ')', {
                        command: true
                    });

                    // TODO: support other commands
                    if (cmd === 'announce' && args.length) {
                        // TODO: test response for security? handle on server...
                        this.announce(args);
                    } else if (cmd === 'warn' && args.length) {
                        var warnBits = args.split(' '),
                            theWarned = warnBits.shift(),
                            warningLevel = 'warning', // TODO: UI options?
                            warningMsg = warnBits.join(' ');

                        $meteor.call('warnUser', theWarned, warningLevel, warningMsg);
                    } else {
                        service.postClientMsg('Invalid command.', {
                            error: true
                        });
                    }
                } else if (msg[0] === '@') {
                    parsed = msg.replace(/\s+/, '\x01').split('\x01');

                    var toWhom = parsed[0].substr(1);
                    var theMsg = parsed[1];

                    service.postClientMsg('<' + toWhom + '> ' + theMsg, {
                        directEcho: true
                    });

                    $meteor.call('chatDirect', toWhom, theMsg);
                } else {
                    $meteor.call('chat', msg);
                }
            };
        }
    ]);
