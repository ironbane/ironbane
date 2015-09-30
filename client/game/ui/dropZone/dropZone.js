angular.module('game.ui.dropZone', [
    'game.world-root',
    'game.services.globalsound'
])
.directive('dropZone', ["$rootWorld", "$q", "GlobalSound", function($rootWorld, $q, GlobalSound) {
        'use strict';

        return {
            restrict: 'EA',
            templateUrl: 'client/game/ui/dropZone/dropZone.ng.html',
            controllerAs: 'dropZone',
            scope: {
                entity: '=' // this can be anything with inventory, player, bag, mob, magic hat, etc.
            },
            bindToController: true,
            controller: ["$scope", "$rootScope", function($scope, $rootScope) {
                var ctrl = this;

                var inventorySystem = $rootWorld.getSystem('inventory')

                $scope.isDragging = false;

                $rootScope.$on('dragStart', function () {
                    $scope.isDragging = true;
                });

                $rootScope.$on('dragStop', function () {
                    $scope.isDragging = false;
                });

                $scope.isHovering = false;

                $scope.onOver = function () {
                    $scope.isHovering = true;
                };

                $scope.onOut = function () {
                    $scope.isHovering = false;
                };

                $scope.beforeDrop = function (e, obj) {
                    var deferred = $q.defer();
                    if (obj.draggable) {
                        var itemUuid = obj.draggable.context.attributes['data-uuid'].value;

                        var item = inventorySystem.findItemByUuid(ctrl.entity, itemUuid);
                        if (item) {
                            $rootWorld.publish('inventory:dropItem', ctrl.entity, item);
                            GlobalSound.play(_.sample(['drop']), ctrl.entity.position);
                            deferred.resolve();
                        }
                        else {
                            deferred.reject();
                        }
                    }
                    else {
                        deferred.reject();
                    }

                    return deferred.promise;
                };

            }]
        };
    }]
);
