angular
    .module('game.ui.inventoryBar', [
        'game.world-root'
    ])
    .directive('inventoryBar', [
        '$log',
        '$rootWorld',
        function($log, $rootWorld) {
            'use strict';

            var config = {
                restrict: 'E',
                templateUrl: 'client/game/ui/inventoryBar/inventoryBar.ng.html',
                scope: {
                    forEntity: '='
                },
                bindToController: true,
                controllerAs: 'inventoryBar',
                controller: ['$scope', function($scope) {
                    var ctrl = this;
                    ctrl.slots = [];

                    var inventorySystem = $rootWorld.getSystem('inventory');

                    var changeHandler = function(entity) {
                        $log.debug('inventoryBar changeHandler: ', entity);
                        if (entity.id !== ctrl.forEntity.id) {
                            return;
                        }
                        var inventory = entity.getComponent('inventory'),
                            slots = Object.keys(inventory);

                        $log.debug('inventoryBar: ', slots, inventory);

                        ctrl.slots = _.map(slots, function(slot) {
                            var spriteName = slot;
                            if (spriteName.search(/slot/) === 0) {
                                spriteName = 'empty';
                            }
                            if (spriteName.search(/relic/) === 0) {
                                spriteName = 'tome';
                            }
                            if (spriteName.search(/hand/ig) >= 0) {
                                spriteName = 'sword';
                            }
                            return {
                                css: 'slot-' + spriteName
                            };
                        });
                    };

                    inventorySystem.onEquipItem.add(changeHandler);
                    inventorySystem.onUnEquipItem.add(changeHandler);
                    inventorySystem.onItemAdded.add(changeHandler);
                    inventorySystem.onItemRemoved.add(changeHandler);

                    $scope.$watch(function() {
                        return ctrl.forEntity;
                    }, function(entity) {
                        if (!entity) {
                            return;
                        }
                        changeHandler(entity);
                    });
                }]
            };

            return config;
        }
    ]);
