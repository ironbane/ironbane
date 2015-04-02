/*global Collections:true*/
angular.module('game.ui.chat.chatBoxDirective', [
        'angular-meteor'
    ])
    .directive('chatBox', [
        function() {
            'use strict';

            return {
                restrict: 'EA',
                templateUrl: 'client/game/ui/chat/chatBox.ng.html',
                controllerAs: 'chatBox',
                controller: [
                    '$meteor',
                    function($meteor) {
                        $meteor.subscribe('chatMessages');

                        this.messages = $meteor.collection(Collections.ChatMessages);
                    }
                ]
            };
        }
    ]);
