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
                        // player commands that aren't tied to an entity
                        var inputSystem = $rootWorld.getSystem('input'),
                            openChatHandler = function() {
                                $log.debug('input actions working!');
                                $scope.showInput = true;
                                $scope.$apply(); // this is outside the digest loop!
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
