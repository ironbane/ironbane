angular
    .module('game.ui.inventoryItem', [
        'ui.bootstrap'
    ])
    .directive('inventoryItem', [
        '$log',
        function($log) {
            'use strict';

            var config = {
                restrict: 'E',
                templateUrl: 'client/game/ui/inventoryItem/inventoryItem.ng.html',
                scope: {
                    item: '='
                },
                bindToController: true,
                controllerAs: 'inventoryItem',
                controller: function($scope) {
                    var ctrl = this;

                    $scope.$watch(function() {
                        return ctrl.item;
                    }, function(item) {
                        if (!item) {
                            return;
                        }

                        $scope.item = item; // for tooltip?

                        var col = item.invImage % 16,
                            row = Math.floor(item.invImage / 16);

                        ctrl.cssStyle = {
                            'background-position': -col * 32 + 'px ' +
                                -row * 32 + 'px'
                        };
                    });
                }
            };

            return config;
        }
    ]);
