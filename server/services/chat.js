/*global check: true*/
angular
    .module('server.services.chat', [
        'models'
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
        function(ChatService, ChatMessagesCollection, ChatRoomsCollection) {
            'use strict';

            Meteor.methods({
                chatAnnounce: ChatService.announce
            });

            // clear rooms on boot (for now)
            ChatRoomsCollection.remove({});
            ChatRoomsCollection.insert({
                roomname: 'global'
            });

            // setup collection permissions for server
            ChatRoomsCollection.deny({
                insert: function(userId, doc) {
                    return true;
                },
                update: function(userId, doc, fieldNames, modifier) {
                    return true;
                },
                remove: function(userId, doc) {
                    return true;
                }
            });

            ChatMessagesCollection.deny({
                insert: function(userId, doc) {
                    return (userId === null);
                },
                update: function(userId, doc, fieldNames, modifier) {
                    return true;
                },
                remove: function(userId, doc) {
                    return true;
                }
            });

            ChatMessagesCollection.allow({
                insert: function(userId, doc) {
                    if (doc.msg.length <= 0) {
                        return false;
                    }

                    doc.msg = doc.msg.substr(0, 255);
                    doc.ts = new Date();
                    // TODO do checks for character name, pos, level etc

                    return (userId !== null);
                }
            });
        }
    ]);
