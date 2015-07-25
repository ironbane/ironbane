angular
    .module('game.ui.inventoryItem', [
        'ui.bootstrap'
    ])
    .directive('inventoryItem', function($log, $sce) {
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
                        $scope.item = item;

                        $scope.cssStyle = { 
                            'background-position': -item.spriteIndexX * 32 + 'px ' + 
                                -item.spriteIndexY * 32 + 'px'
                        }
                    });                    
                }
            };

            return config;
        }
    );
