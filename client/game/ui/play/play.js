angular
    .module('game.ui.play', [
        'ui.router',
        'engine.game-service',
        'engine.entity-builder',
        'game.ui.debug.debugDiv'
    ])
    .config([
        '$stateProvider',
        '$locationProvider',
        function($stateProvider, $locationProvider) {
            'use strict';

            $locationProvider.html5Mode(true);

            $stateProvider.state('play', {
                templateUrl: 'client/game/ui/play/play.ng.html'
            });
        }
    ]);
