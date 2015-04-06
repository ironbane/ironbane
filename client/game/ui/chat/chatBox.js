/*global Collections:true, Entities: true*/
angular.module('game.ui.chat.chatBoxDirective', [
        'angular-meteor',
        'luegg.directives',
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
                    function($meteor, $scope, $attrs, $window) {
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
                                            user: {
                                                name: currentCharacter.name
                                                // TODO: add flags here, based on roles? (publish?)
                                            },
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
                ]
            };
        }
    ]);
