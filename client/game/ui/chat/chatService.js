angular.module('game.ui.chat.chatService', [
        'angular-meteor'
    ])
    .service('ChatService', [
        '$meteor',
        function($meteor) {
            'use strict';

            this.announce = function(msg) {
                return $meteor.call('chatAnnounce', msg);
            };
        }
    ]);
