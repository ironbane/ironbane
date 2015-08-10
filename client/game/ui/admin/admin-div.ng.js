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

                    // These have to kept sync with the actual armor images in the images/characters/ folders until I figure
                    // out how these can be autoread and sent to the client
                    $scope.armorImages = {
                        'body': [1,10,102,11,12,16,19,2,200,203,204,205,206,23,3,4,5,6,7,8,81,82,83,9,94,95,97,99],
                        'feet': [1,10,100,103,104,11,12,13,15,2,20,24,3,4,5,6,7,84,85,9],
                        'head': [1,10,101,105,11,12,13,14,15,16,17,18,2,201,202,21,22,25,3,4,5,6,7,8,86,87,89,9,93,95,96,98]
                    };
                }]
            };
        }
    ]);
