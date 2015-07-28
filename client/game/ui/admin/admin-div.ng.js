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
                        $scope.imageId = (Math.floor(e.offsetX / 32)) + ((0+Math.floor(e.offsetY / 32))*16)
                    };
                }]
            };
        }
    ]);
