angular
    .module('game.ui.main-menu.server-select', [
        'ui.router'
    ])
    .config(['$stateProvider', function ($stateProvider) {
        'use strict';

        $stateProvider.state('main-menu.server-select', {
            templateUrl: 'client/game/ui/main-menu/server-select/server-select.ng.html',
            controller: ['$scope', '$state', function ($scope, $state) {

            }]
        });
    }]);
