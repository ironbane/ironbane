angular
    .module('game.ui.inventoryBar', [
        'models.inventory',
        'angular-meteor'
    ])
    .directive('inventoryBar', [
        '$log',
        '$sce',
        function($log, $sce) {
            'use strict';

            var config = {
                restrict: 'E',
                templateUrl: 'client/game/ui/inventoryBar/inventoryBar.ng.html',
                scope: {

                },
                bindToController: true,
                controllerAs: 'inventoryBar',
                controller: ['$scope', '$meteor', 'InventoryCollection', 'EntitiesCollection', function($scope, $meteor, InventoryCollection, EntitiesCollection) {

                    // Passing an empty object to $meteorObject as the selector
                    // appears to use findOne, which works better for our case as
                    // we only want a single result instead of having to loop over an
                    // array with ng-repeat which we know has only 1 element.
                    $scope.inventory = $scope.$meteorObject(InventoryCollection, {});

                    $scope.slots = [
                        {
                            name: 'head',
                            backgrounds: [[0,2],[0,0]]
                        },
                        {
                            name: 'body',
                            backgrounds: [[2,2],[0,0]]
                        },
                        {
                            name: 'feet',
                            backgrounds: [[1,2],[0,0]]
                        },
                        {
                            name: 'rhand',
                            backgrounds: [[0,1],[0,0]]
                        },
                        {
                            name: 'lhand',
                            backgrounds: [[0,1],[0,0]]
                        },
                        {
                            name: 'relic1',
                            backgrounds: [[1,1],[1,0]]
                        },
                        {
                            name: 'relic2',
                            backgrounds: [[1,1],[1,0]]
                        },
                        {
                            name: 'relic3',
                            backgrounds: [[1,1],[1,0]]
                        },
                        {
                            name: 'slot0',
                            backgrounds: [[0,3], [2,0]]
                        },
                        {
                            name: 'slot1',
                            backgrounds: [[1,3], [2,0]]
                        },
                        {
                            name: 'slot2',
                            backgrounds: [[2,3], [2,0]]
                        },
                        {
                            name: 'slot3',
                            backgrounds: [[3,3], [2,0]]
                        },
                        {
                            name: 'slot4',
                            backgrounds: [[0,4], [2,0]]
                        },
                        {
                            name: 'slot5',
                            backgrounds: [[1,4], [2,0]]
                        },
                        {
                            name: 'slot6',
                            backgrounds: [[2,4], [2,0]]
                        },
                        {
                            name: 'slot7',
                            backgrounds: [[3,4], [2,0]]
                        },
                    ];

                    $scope.slots = _.map($scope.slots, function(slot) {
                        var cssBackgrounds = [];
                        slot.backgrounds.forEach(function (bg) {
                            bg[0] *= -32;
                            bg[1] *= -32;
                            cssBackgrounds.push(bg.join('px ') + 'px');
                        });
                        slot.cssStyle = {
                            'background-position': cssBackgrounds.join(',')
                        };
                        return slot;
                    });

                    $meteor.autorun($scope, function () {
                        var currentCharacter = EntitiesCollection.findOne({
                            owner: Meteor.userId(),
                            active: true
                        });
                        if (currentCharacter) {
                            $meteor.subscribe('inventory', currentCharacter._id);
                        }
                    })

                }]
            };

            return config;
        }
    ]);
