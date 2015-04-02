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
                    '$scope',
                    '$attrs',
                    '$window',
                    '$log',
                    function($meteor, $scope, $attrs, $window, $log) {
                        var ctrl = this,
                            keyTrapHandler = function(event) {
                                $log.debug('keyTrapHandler');
                                event.stopPropagation();
                            };

                        $meteor.subscribe('chatMessages');

                        ctrl.messages = $meteor.collection(Collections.ChatMessages);

                        ctrl.trapKeys = function() {
                            $window.addEventListener('keydown', keyTrapHandler, true);
                        };

                        ctrl.untrapKeys = function() {
                            $window.removeEventListener('keydown', keyTrapHandler, true);
                        };

                        $scope.$watch($attrs.showInput, function(showInput) {
                            var shouldShowInput = $scope.$eval(showInput);

                            ctrl.showInput = shouldShowInput;
                        });
                    }
                ]
            };
        }
    ]);
