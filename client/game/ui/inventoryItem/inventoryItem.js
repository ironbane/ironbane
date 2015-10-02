angular
    .module('game.ui.inventoryItem', [
        'ui.bootstrap',
        'game.ui.spritesheetImage',
        'engine.char-builder',
        'engine.util',
        'models.items'
    ])
    .directive('inventoryItem', [
        'ItemsCollection',
        function(ItemsCollection) {
            'use strict';

            var config = {
                restrict: 'E',
                templateUrl: 'client/game/ui/inventoryItem/inventoryItem.ng.html',
                scope: {
                    item: '='
                },
                bindToController: true,
                controllerAs: 'inventoryItem',
                controller: ['$scope', function($scope) {
                    var ctrl = this;

                    $scope.$watch(function() {
                        return ctrl.item;
                    }, function(item) {
                        if (!item) {
                            return;
                        }

                        var itemTemplate = ItemsCollection.findOne({name: item.name});
                        if (itemTemplate && itemTemplate.displayNotes) {
                            item.displayNotes = itemTemplate.displayNotes;
                        }

                        $scope.item = item; // for tooltip?

                        var image = item.invImage ? item.invImage : item.image;

                        var col = image % 16,
                            row = Math.floor(image / 16);

                        ctrl.cssStyle = {
                            'background-position': -col * 32 * 1.5 + 'px ' +
                                -row * 32 * 1.5 + 'px'
                        };

                        ctrl.cssClass = item.rarity;
                    });
                }]
            };

            return config;
        }]);
