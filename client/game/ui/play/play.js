'use strict';

angular
    .module('game.ui.play', [
        'ui.router',
        'engine.game-service'
    ])
    .config(function ($stateProvider) {
        $stateProvider.state('play', {
            templateUrl: 'client/game/ui/play/play.ng.html'
        });
    });
