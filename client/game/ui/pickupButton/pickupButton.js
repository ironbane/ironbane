angular.module('game.ui.pickupButton', [
    'game.world-root',
    'game.services.globalsound'
])
.directive('pickupButton', ['$rootWorld', '$q', 'GlobalSound', function($rootWorld, $q, GlobalSound) {
        'use strict';

        return {
            restrict: 'EA',
            templateUrl: 'client/game/ui/pickupButton/pickupButton.ng.html',
            controllerAs: 'pickupButton',
            scope: {
                entity: '=' // this can be anything with inventory, player, bag, mob, magic hat, etc.
            },
            bindToController: true,
            controller: ['$scope', '$rootScope', function($scope, $rootScope) {
                var ctrl = this;

                var inventorySystem = $rootWorld.getSystem('inventory')

                $scope.$watch(function() {
                    return inventorySystem.closePickup;
                }, function(pickup) {
                    if (pickup) {
                        $scope.item = pickup.getComponent('pickup').item;
                    }
                    else {
                        $scope.item = null;
                    }
                });

            }]
        };
    }]
);
