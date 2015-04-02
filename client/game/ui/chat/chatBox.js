/*global Collections:true*/
angular.module('game.ui.chat.chatBoxDirective', [
        'angular-meteor',
        'game.ui.directives'
    ])
    .directive('chatBox', [
        function() {
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
                    '$log',
                    function($meteor, $scope, $attrs, $window, $log) {
                        var ctrl = this,
                            keyTrapHandler = function(event) {
                                //$log.debug('keyTrapHandler');
                                event.stopPropagation();

                                if (event.keyCode === 13) {
                                    $scope.$apply(function() {
                                        ctrl.messages.push({ts: new Date(), msg: ctrl.newmsg, userId: Meteor.userId()});
                                        ctrl.showInput = false;
                                        ctrl.newmsg = '';
                                    });
                                }
                            };

                        $meteor.subscribe('chatMessages');

                        ctrl.messages = $meteor.collection(Collections.ChatMessages);

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
