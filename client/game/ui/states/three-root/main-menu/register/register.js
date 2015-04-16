angular
    .module('game.ui.states.three-root.main-menu.register', [
        'engine.util.browserUtil',
        'game.ui.dialog',
        'ui.router',
        'models.accounts'
    ])
    .config(['$stateProvider', function($stateProvider) {
        'use strict';

        $stateProvider.state('three-root.main-menu.register', {
            templateUrl: 'client/game/ui/states/three-root/main-menu/register/register.ng.html',
            controller: [
                '$scope',
                '$state',
                'BrowserUtil',
                'dialogService',
                'AccountsCollection',
                function($scope, $state, BrowserUtil, dialogService, AccountsCollection) {

                    $scope.register = function() {
                        AccountsCollection.createUser({
                            username: $scope.username,
                            password: $scope.password,
                            email: $scope.email
                        }, function(err) {
                            if (err) {
                                dialogService.alert(err.reason);
                            } else {
                                $state.go('^.enter-world');
                            }
                        });
                    };

                    $scope.cancel = function() {
                        $state.go('^.enter-world');
                    };

                    $scope.showPassword = BrowserUtil.isMobile;
                }
            ]
        });
    }]);
