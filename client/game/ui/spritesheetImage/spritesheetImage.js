angular
    .module('game.ui.spritesheetImage', [
        'engine.char-builder',
        'engine.util'
    ])
    .directive('spritesheetImage', [
        '$log',
        'CharBuilder',
        'IbUtils',
        function($log, CharBuilder, IbUtils) {
            'use strict';

            var config = {
                restrict: 'E',
                templateUrl: 'client/game/ui/spritesheetImage/spritesheetImage.ng.html',
                scope: {
                    sheet: '=',
                    id: '=',
                    scale: '='
                },
                // bindToController: true,
                // controllerAs: 'spritesheetImage',
                controller: ['$scope', '$attrs', function($scope, $attrs) {
                    var p;

                    if ($attrs.sheet === 'items') {
                        p = CharBuilder.getSpriteSheetTile('images/spritesheets/items.png',
                            IbUtils.spriteSheetIdToXY(parseInt($attrs.id, 10), 16).h,
                            IbUtils.spriteSheetIdToXY(parseInt($attrs.id, 10), 16).v,
                            16, 128);
                    }
                    if ($attrs.sheet === 'stats') {
                        p = CharBuilder.getSpriteSheetTile('images/ui/stats.png',
                            IbUtils.spriteSheetIdToXY(parseInt($attrs.id, 10), 4).h,
                            IbUtils.spriteSheetIdToXY(parseInt($attrs.id, 10), 4).v,
                            4, 16);
                    }

                    if (p) {
                        if ($attrs.scale) {
                            p = p.then(function(url) {
                                return CharBuilder.resize(url, parseFloat($attrs.scale));
                            });
                        }

                        p = p.then(function(url) {
                            $scope.imageUrl = url;
                        });
                    }
                }]
            };

            return config;
        }
    ]);
