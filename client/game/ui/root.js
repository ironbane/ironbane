angular
    .module('game.ui', [
        'ui.router',
        'game.ui.play',
        'game.ui.main-menu'
    ])
    .run(function ($state, GameService) {
        'use strict';

        GameService.start();

        $state.go('main-menu.play-mode');
    });
