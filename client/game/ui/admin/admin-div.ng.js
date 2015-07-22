angular.module('game.ui.admin.adminDiv', [
        'game.clientSettings'
    ])
    .directive('adminDiv', [

        function() {
            'use strict';

            return {
                restrict: 'EA',
                templateUrl: 'client/game/ui/admin/admin-div.ng.html',
                controllerAs: 'adminDiv',
                controller: ['$scope', '$clientSettings', function($scope, $clientSettings) {

                    $scope.getImageID = function (e) {
                        $scope.imageId = (1+Math.floor(e.offsetY / 32)) * (1+Math.floor(e.offsetX / 32))
                    };
                }]
            };
        }
    ]);
