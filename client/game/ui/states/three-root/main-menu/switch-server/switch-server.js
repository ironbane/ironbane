angular
    .module('game.ui.states.three-root.main-menu.switch-server', [
        'game.ui.dialog',
        'global.constants',
        'ui.router',
        'models.accounts'
    ])
    .config(["$stateProvider", function($stateProvider) {
        'use strict';

        $stateProvider.state('three-root.main-menu.switch-server', {
            templateUrl: 'client/game/ui/states/three-root/main-menu/switch-server/switch-server.ng.html',
            controller: ["$scope", "$rootScope", "$state", "dialogService", "IB_CONSTANTS", "$meteor", "ServersCollection", function($scope, $rootScope, $state, dialogService, IB_CONSTANTS, $meteor, ServersCollection) {

                $scope.$meteorSubscribe('servers');

                $scope.servers = $meteor.collection(ServersCollection);

                $scope.switchServer = function (server) {
                    Cookies.set('SERVERID', server.id);
                    location.reload();
                };

                $scope.cancel = function() {
                    $state.go('^.enter-world');
                };
            }]
        });
    }]);
