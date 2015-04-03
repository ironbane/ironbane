angular
    .module('game.ui.main-menu', [
        'ui.router',
        'game.ui.main-menu.enter-world',
        'game.ui.main-menu.create-char',
        'game.ui.main-menu.login',
        'game.ui.main-menu.register',
    ])
    .config(['$stateProvider', function($stateProvider) {
        'use strict';

        $stateProvider.state('main-menu', {
            templateUrl: 'client/game/ui/main-menu/main-menu.ng.html',
            abstract: true,
            controller: ['$scope', function($scope) {
                $scope.logout = function() {
                    Meteor.logout();
                };
            }]
        });
    }]);
