angular
    .module('game.ui.main-menu.server-select', [
        'ui.router'
    ])
    .config(function ($stateProvider) {
        'use strict';

        $stateProvider.state('main-menu.server-select', {
            templateUrl: 'game/ui/main-menu/server-select/server-select.tpl.html',
            controller: function ($scope, $state) {

            }
        });
    });
