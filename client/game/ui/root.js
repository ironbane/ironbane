angular
    .module('game.ui', [
        'ui.router',
        'game.ui.play',
        'game.ui.main-menu'
    ])
    .run(function ($state) {
        'use strict';

        $state.go('main-menu.play-mode');
    });
