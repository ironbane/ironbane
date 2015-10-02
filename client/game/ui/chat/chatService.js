angular.module('game.ui.chat.chatService', [
        'angular-meteor',
        'models.chatMessages',
        'game.ui.bigMessages.bigMessagesService',
        'game.ui.dialog'
    ])
    .service('ChatService', [
        '$meteor',
        'ChatMessagesCollection',
        'BigMessagesService',
        'dialogService',
        '$rootWorld',
        function($meteor, ChatMessagesCollection, BigMessagesService, dialogService, $rootWorld) {
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
                    } else if (cmd === 'stuck') {
                        $meteor.call('resetPlayer')
                            .then(function () {
                                BigMessagesService.add('Teleporting home...');
                            }, function(err) {
                                if (err) {
                                    dialogService.alert(err.reason);
                                }
                            });
                    } else if (cmd === 'help') {
                        // TODO: load remotely
                        var helpText = [
                            '<p><u>Chat commands</u></p>',
                            '<p><strong>/stuck</strong> Teleport home</p>',
                            '<p><strong>@name</strong> Direct message</p>',
                            '<p><strong>/who</strong> Show who\'s online</p>',
                            '<p><strong>/help</strong> Show this help</p>',
                            '<p><u>Controls</u></p>',
                            '<p><strong>C</strong> Change camera</p>',
                            '<p><strong>1 - 8</strong> Use item in slot #</p>',
                            '<p><strong>Left Click or F</strong> Attack</p>',
                            '<p><strong>Space</strong> Jump</p>',
                            '<p><strong>WASD</strong> Move</p>',
                        ].join('');
                        dialogService.alert(helpText, '', 'Help');
                    } else if (cmd === 'who') {
                        var online = $rootWorld.getEntities('player');
                        var onlineText = [
                            '<ul>'
                        ];
                        online.map(function(user) {
                            return user.name;
                        }).forEach(function(name) {
                            onlineText.push('<li>' + name + '</li>');
                        });
                        onlineText.push('</ul>');

                        dialogService.alert(onlineText.join(''), '', online.length + ' Users Online');
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
