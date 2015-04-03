angular
    .module('game.ui.states.three-root.main-menu.login', [
        'ui.router',
        'angular-meteor'
    ])
    .config(['$stateProvider', function($stateProvider) {
        'use strict';

        $stateProvider.state('three-root.main-menu.login', {
            templateUrl: 'client/game/ui/states/three-root/main-menu/login/login.ng.html',
            controller: [
                '$scope',
                '$state',
                '$meteor',
                function($scope, $state, $meteor) {
                    $scope.login = function() {
                        $meteor.loginWithPassword($scope.username, $scope.password)
                            .catch(function(err) {
                                // should show error in UI instead?
                                throw err;
                            });
                    };

                    $scope.cancel = function() {
                        $state.go('^.enter-world');
                    };
                }
            ]
        });
    }]);
