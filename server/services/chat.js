/*global check: true,Roles: true*/
angular
    .module('server.services.chat', [
        'models',
        'server.services.activeWorlds',
        'server.services.character'
    ])
    .service('ChatService', [
        'ChatMessagesCollection',
        'CharacterService',
        function(ChatMessagesCollection, CharacterService) {
            'use strict';

            function getUserFlags(userId) {
                if (userId === 'system') {
                    return {
                        admin: true,
                        system: true
                    };
                }

                return {
                    gm: Roles.userIsInRole(userId, ['game-master']),
                    admin: Roles.userIsInRole(userId, ['admin'])
                        // TODO: guest, other
                };
            }

            this.addMessage = function(userId, msg, flags) {
                var character;

                if (userId === 'system') {
                    character = {
                        name: null
                    };
                } else {
                    character = CharacterService.getActiveCharacter(userId);
                }

                if (!character) {
                    // can't chat if not logged in
                    return;
                }

                var name = character.name;

                if (Roles.userIsInRole(userId, ['game-master'])) {
                    name = '<GM> ' + name;

                    // Later can add additional things like clans, ranks etc
                }

                ChatMessagesCollection.insert({
                    server: Meteor.settings.server.id,
                    room: 'global',
                    ts: new Date(),
                    msg: msg,
                    flags: flags,
                    user: {
                        userId: userId,
                        name: name,
                        flags: getUserFlags(userId)
                    }
                });
            };

            this.announce = function(msg, flags) {
                this.addMessage('system', msg, _.extend({}, flags, {
                    system: true,
                    announcement: true
                }));
            };

            this.directMessage = function(fromUserId, toUserId, msg, flags) {
                var fromChar = null;
                if (fromUserId === 'system') {
                    fromChar = {
                        name: 'system'
                    };
                }

                if (!fromChar) {
                    fromChar = CharacterService.getActiveCharacter(fromUserId);
                }

                var toChar = CharacterService.getActiveCharacter(toUserId);

                if (!fromChar || !toChar) {
                    console.log('cant DM: ', fromChar, toChar);
                    // can't msg offline
                    // TODO: allow? makes it harder to know which char by userId
                    return;
                }

                flags = _.extend({}, flags, {
                    direct: true
                });

                ChatMessagesCollection.insert({
                    server: Meteor.settings.server.id,
                    room: 'global',
                    ts: new Date(),
                    msg: msg,
                    flags: flags,
                    user: {
                        userId: toUserId,
                        name: toChar.name,
                        flags: getUserFlags(toUserId)
                    },
                    from: {
                        userId: fromUserId,
                        name: fromChar.name,
                        flags: getUserFlags(fromUserId)
                    }
                });
            };
        }
    ])
    .run([
        'ChatService',
        'ChatMessagesCollection',
        'ChatRoomsCollection',
        'CharacterService',
        function(ChatService, ChatMessagesCollection, ChatRoomsCollection, CharacterService) {
            'use strict';

            Meteor.methods({
                chatAnnounce: function(msg, flags) {
                    ChatService.announce(msg, flags);
                },
                chat: function(msg, flags) {
                    if (!angular.isString(msg) || msg.length <= 0) {
                        return;
                    }

                    // truncate long msgs
                    msg = msg.substr(0, 255);

                    ChatService.addMessage(this.userId, msg, flags);
                },
                chatDirect: function(toCharName, msg) {
                    if (!angular.isString(msg) || msg.length <= 0) {
                        return;
                    }

                    // truncate long msgs
                    msg = msg.substr(0, 255);

                    var toChar = CharacterService.getCharacterByName(toCharName);

                    if (!toChar) {
                        return;
                    }

                    ChatService.directMessage(this.userId, toChar.owner, msg);
                }
            });

            // clear rooms on boot (for now)
            ChatRoomsCollection.remove({});
            ChatRoomsCollection.insert({
                roomname: 'global'
            });

            ChatMessagesCollection.allow({
                insert: function(userId, doc) {
                    var valid = (doc.flags && doc.flags.local && doc.user && doc.user.userId === userId);
                    //console.log('insert attempt (' + valid + '): ', userId, doc);

                    doc.server = Meteor.settings.server.id;

                    return valid;
                },
                remove: function(userId, doc) {
                    // allow the client to clean its own local history
                    return (doc.user && doc.user.userId === userId && doc.flags && doc.flags.local);
                }
            });

            Meteor.publish('chatMessages', function() {
                return ChatMessagesCollection.find({
                    server: Meteor.settings.server.id,
                    $or: [{
                        $and: [{
                            'flags.local': {
                                $exists: false
                            }
                        }, {
                            'flags.direct': {
                                $exists: false
                            }
                        }]
                    }, {
                        $and: [{
                            'flags.local': true
                        }, {
                            'user.userId': this.userId
                        }]
                    }, {
                        $and: [{
                            'flags.direct': true
                        }, {
                            'user.userId': this.userId
                        }]
                    }]
                }, {
                    sort: {
                        ts: -1
                    },
                    limit: 50
                });
            });
        }
    ]);
