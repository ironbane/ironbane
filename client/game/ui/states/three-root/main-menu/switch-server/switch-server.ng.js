angular
    .module('game.ui.states.three-root.main-menu.switch-server', [
        'game.ui.dialog',
        'global.constants',
        'ui.router',
        'models.accounts'
    ])
    .config(function($stateProvider) {
        'use strict';

        $stateProvider.state('three-root.main-menu.switch-server', {
            templateUrl: 'client/game/ui/states/three-root/main-menu/switch-server/switch-server.ng.html',
            controller: function($scope, $rootScope, $state, dialogService, IB_CONSTANTS, $meteor, ServersCollection) {

                $scope.servers = $meteor.collection(ServersCollection);

                $scope.switchServer = function (server) {

                };

                $scope.cancel = function() {
                    $state.go('^.enter-world');
                };
            }
        });
    });
