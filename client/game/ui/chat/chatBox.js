angular.module('game.ui.chat.chatBoxDirective', [
        'angular-meteor',
        'luegg.directives',
        'game.ui.directives',
        'models.chatMessages'
    ])
    .directive('chatBox', [
        'ChatMessagesCollection',
        function(ChatMessagesCollection) {
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
                    '$meteor',
                    '$scope',
                    '$attrs',
                    '$window',
                    function($meteor, $scope, $attrs, $window) {
                        var ctrl = this,
                            keyTrapHandler = function(event) {
                                //$log.debug('keyTrapHandler');
                                event.stopPropagation();

                                if (event.keyCode === 13) {
                                    $meteor.call('chat', ctrl.newmsg);
                                    ctrl.showInput = false;
                                    ctrl.newmsg = '';
                                }
                            };

                        $meteor.subscribe('chatMessages');

                        ctrl.messages = $meteor.collection(ChatMessagesCollection);

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
