'use strict';

angular
    .module('game.ui.play', [
        'ui.router',
        'engine.game-service',
        'engine.entity-builder',
    ])
    .config(function ($stateProvider, $locationProvider) {
    	$locationProvider.html5Mode(true);

        $stateProvider.state('play', {
            templateUrl: 'client/game/ui/play/play.ng.html'
        });
    });
