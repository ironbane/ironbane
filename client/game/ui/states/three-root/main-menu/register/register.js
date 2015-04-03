/*global Accounts*/
angular
    .module('game.ui.states.three-root.main-menu.register', [
        'engine.util.browserUtil',
        'ui.router'
    ])
    .config(['$stateProvider', function($stateProvider) {
        'use strict';

        $stateProvider.state('three-root.main-menu.register', {
            templateUrl: 'client/game/ui/states/three-root/main-menu/register/register.ng.html',
            controller: [
                '$scope',
                '$state',
                'BrowserUtil',
                function($scope, $state, BrowserUtil) {

                    $scope.register = function() {
                        Accounts.createUser({
                            username: $scope.username,
                            password: $scope.password,
                            email: $scope.email
                        }, function(err) {
                            if (err) {
                                throw err;
                            } else {
                                $state.go('^.enter-world');
                            }
                        });
                        // GameService.enterGame($scope.nickname);
                    };

                    $scope.cancel = function() {
                        $state.go('^.enter-world');
                    };

                    $scope.showPassword = BrowserUtil.isMobile;
                }
            ]
        });
    }]);
