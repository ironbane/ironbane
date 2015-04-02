angular
    .module('game.ui.play', [
        'ui.router',
        'engine.game-service',
        'engine.entity-builder',
        'game.ui.debug.debugDiv',
        'game.ui.chat.chatBoxDirective',
        'game.world-root'
    ])
    .config([
        '$stateProvider',
        '$locationProvider',
        function($stateProvider, $locationProvider) {
            'use strict';

            $locationProvider.html5Mode(true);

            $stateProvider.state('play', {
                templateUrl: 'client/game/ui/play/play.ng.html',
                controller: [
                    '$scope',
                    '$rootWorld',
                    '$log',
                    function($scope, $rootWorld, $log) {
                        $scope.gui = {
                            showChatInput: false
                        };

                        // player commands that aren't tied to an entity
                        var inputSystem = $rootWorld.getSystem('input'),
                            openChatHandler = function() {
                                $scope.$applyAsync(function() {
                                    $scope.gui.showChatInput = true;
                                });
                            };

                        inputSystem.register('open-chat', openChatHandler);

                        $scope.$on('$destroy', function() {
                            inputSystem.unregister('open-chat', openChatHandler);
                        });
                    }
                ]
            });
        }
    ]);
