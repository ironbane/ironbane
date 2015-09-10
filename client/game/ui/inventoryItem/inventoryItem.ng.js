angular
    .module('game.ui.inventoryItem', [
        'ui.bootstrap',
        'engine.char-builder',
        'engine.util'
    ])
    .directive('inventoryItem', [
        '$log',
        'CharBuilder',
        'IbUtils',
        function($log, CharBuilder, IbUtils) {
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

                        $scope.item = item; // for tooltip?

                        var image = item.invImage ? item.invImage : item.image;

                        var col = image % 16,
                            row = Math.floor(image / 16);

                        ctrl.cssStyle = {
                            'background-position': -col * 32 + 'px ' +
                                -row * 32 + 'px'
                        };

                        CharBuilder.getSpriteSheetTile('images/ui/stats.png', 3, 1, 4, 3)
                        .then(function (url) {
                            return CharBuilder.resize(url, 2);
                        })
                        .then(function (url) {
                            $scope.healthUrl = url;
                        });

                        CharBuilder.getSpriteSheetTile('images/ui/stats.png', 1, 1, 4, 3)
                        .then(function (url) {
                            return CharBuilder.resize(url, 2);
                        })
                        .then(function (url) {
                            $scope.armorUrl = url;
                        });

                        CharBuilder.getSpriteSheetTile('images/ui/stats.png', 1, 1, 4, 3)
                        .then(function (url) {
                            return CharBuilder.resize(url, 2);
                        })
                        .then(function (url) {
                            $scope.armorUrl = url;
                        });

                        CharBuilder.getSpriteSheetTile('images/spritesheets/items.png',
                            IbUtils.spriteSheetIdToXY(1945).h,
                            IbUtils.spriteSheetIdToXY(1945).v,
                            16, 128)
                        .then(function (url) {
                            return CharBuilder.resize(url, 2);
                        })
                        .then(function (url) {
                            $scope.damageUrl = url;
                        });

                        ctrl.cssClass = item.rarity;
                    });
                }]
            };

            return config;
        }
    ]);
