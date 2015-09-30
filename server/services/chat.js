/*global check: true*/
angular
    .module('server.services.chat', [
        'models',
        'server.services.activeWorlds'
    ])
    .service('ChatService', [
        'ChatMessagesCollection',
        function(ChatMessagesCollection) {
            'use strict';

            this.announce = function(msg, flags) {
                check(msg, String);

                flags = flags || {};

                // TODO: some other check that the client should be able to post an announcment!

                angular.extend(flags, {
                    system: true,
                    announcement: true
                });


                ChatMessagesCollection.insert({
                    server: Meteor.settings.server.id,
                    room: 'global',
                    ts: new Date(),
                    msg: msg,
                    flags: flags
                });

            };
        }
    ])
    .run([
        'ChatService',
        'ChatMessagesCollection',
        'ChatRoomsCollection',
        '$activeWorlds',
        function(ChatService, ChatMessagesCollection, ChatRoomsCollection, $activeWorlds) {
            'use strict';

            Meteor.methods({
                chatAnnounce: ChatService.announce
            });

            // clear rooms on boot (for now)
            ChatRoomsCollection.remove({});
            ChatRoomsCollection.insert({
                roomname: 'global'
            });

            Meteor.methods({
                chat: function(msg, msgFlags) {

                    if (!_.isString(msg)) {
                        return;
                    }

                    if (msg.length <= 0) {
                        return false;
                    }

                    var me = this;

                    msg = msg.substr(0, 255);

                    var flags = [];

                    if (Roles.userIsInRole(me.userId, ['game-master'])) {
                        flags.push('gm');
                    }

                    msgFlags = msgFlags || {};

                    _.each($activeWorlds, function(world) {
                        var playerEntities = world.getEntities('player');
                        playerEntities.forEach(function(player) {
                            if (player.owner === me.userId) {
                                ChatMessagesCollection.insert({
                                    server: Meteor.settings.server.id,
                                    room: 'global',
                                    ts: new Date(),
                                    msg: msg,
                                    flags: msgFlags,
                                    user: {
                                        userId: me.userId,
                                        name: player.name,
                                        flags: flags
                                    },
                                    pos: player.position
                                });
                            }
                        });
                    });

                }
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
                        'flags.local': {
                            $exists: false
                        }
                    }, {
                        $and: [{
                            'flags.local': true
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
