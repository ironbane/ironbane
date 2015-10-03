angular.module('game.ui.chat.chatBoxDirective', [
        'angular-meteor',
        'luegg.directives',
        'game.ui.directives',
        'game.ui.chat.chatService',
    ])
    .directive('chatBox', [
        'ChatService',
        function(ChatService) {
            'use strict';

            return {
                restrict: 'EA',
                templateUrl: 'client/game/ui/chat/chatBox.ng.html',
                scope: {
                    showInput: '='
                },
                bindToController: true,
                controllerAs: 'chatBox',
                controller: [
                    '$scope',
                    '$attrs',
                    '$window',
                    function($scope, $attrs, $window) {
                        var ctrl = this,
                            keyTrapHandler = function(event) {
                                //$log.debug('keyTrapHandler');
                                event.stopPropagation();

                                if (event.keyCode === 13) {
                                    ChatService.parseCommand(ctrl.newmsg);
                                    ctrl.showInput = false;
                                    ctrl.newmsg = '';
                                    setTimeout(function () {
                                        ctrl.untrapKeys();
                                    }, 100);
                                }
                            };

                        ctrl.messages = ChatService.messages;

                        $scope.$on('open-chat-tell', function() {
                            ctrl.newmsg = '@';
                        });

                        $scope.$on('open-chat-command', function() {
                            ctrl.newmsg = '/';
                        });

                        ctrl.trapKeys = function() {
                            $window.addEventListener('keydown', keyTrapHandler, true);
                        };

                        ctrl.untrapKeys = function() {
                            $window.removeEventListener('keydown', keyTrapHandler, true);
                        };

                    }
                ]
            };
        }
    ]);
