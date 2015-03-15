angular
    .module('game.ui.main-menu', [
        'ui.router',
        'game.ui.main-menu.play-mode',
        'game.ui.main-menu.server-select',
        'game.ui.main-menu.level-select'
    ])
    .config(function ($stateProvider) {
        'use strict';

        $stateProvider.state('main-menu', {
            templateUrl: 'game/ui/main-menu/main-menu.tpl.html',
            abstract: true,
            controller: function ($scope) {

            }
        });
    });
