angular
    .module('game.ui', [
        'ui.router',
        'game.ui.directives',
        'game.ui.play',
        'game.ui.main-menu'
    ])
    .run(['$state', 'GameService', function ($state, GameService) {
        'use strict';

        GameService.start();
    }]);
