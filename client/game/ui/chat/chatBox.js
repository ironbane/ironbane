/*global Collections:true, Entities: true*/
angular.module('game.ui.chat.chatBoxDirective', [
        'angular-meteor',
        'game.ui.directives'
    ])
    .directive('chatBox', [
        '$timeout',
        function($timeout) {
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
                            currentCharacter = Entities.findOne({
                                owner: Meteor.userId(),
                                active: true
                            }),
                            keyTrapHandler = function(event) {
                                //$log.debug('keyTrapHandler');
                                event.stopPropagation();

                                if (event.keyCode === 13) {
                                    $scope.$apply(function() {
                                        ctrl.messages.unshift({
                                            ts: new Date(),
                                            msg: ctrl.newmsg,
                                            userId: Meteor.userId(),
                                            name: currentCharacter.name,
                                            pos: currentCharacter.position,
                                            room: currentCharacter.level
                                        });
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
                ],
                link: function(scope, el) {
                    $timeout(function() { el.find('ul').scrollTop(9999);}, 100);
                }
            };
        }
    ]);
