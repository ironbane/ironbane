angular
    .module('game.ui.main-menu.play-mode', [
    	'engine.game-service',
        'ui.router'
    ])
    .config(function ($stateProvider) {
        'use strict';

        $stateProvider.state('main-menu.play-mode', {
            templateUrl: 'client/game/ui/main-menu/play-mode/play-mode.ng.html',
            controller: function ($scope, $state, GameService) {
                $scope.play = function() {
                    GameService.enterGame();
                };
            }
        });
    });
