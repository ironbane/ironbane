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
                        // $log.debug('inventoryBar changeHandler: ', entity);
                        if (entity.id !== ctrl.forEntity.id) {
                            return;
                        }
                        var inventory = entity.getComponent('inventory'),
                            slots = Object.keys(inventory);

                        // $log.debug('inventoryBar: ', slots, inventory);

                        ctrl.slots = _.map(slots, function(slot) {
                            var bg = ['0px', '0px'];
                            // if (slot.search(/slot/) === 0) {
                            //     bg[0] = '0px';
                            //     bg[1] = '-16px';
                            // }
                            // if (slot.search(/relic/) === 0) {
                            //     bg[0] = '-16px';
                            //     bg[1] = '-48px';
                            // }
                            // if (slot.search(/hand/ig) >= 0) {
                            //     bg[0] = '-48px';
                            //     bg[1] = '-16px';
                            // }
                            // if (slot === 'head') {
                            //     bg[0] = '-32px';
                            //     bg[1] = '-16px';
                            // }
                            // if (slot === 'feet') {
                            //     bg[0] = '-16px';
                            //     bg[1] = '0px';
                            // }
                            // if (slot === 'body') {
                            //     bg[0] = '-32px';
                            //     bg[1] = '0px';
                            // }

                            var images = [
                                'url(images/ui/inventory.png) ' + bg.join(' ') + ' no-repeat' // background LAST
                            ];

                            if (inventory[slot] !== null) {
                                images.unshift('url(images/items/' + inventory[slot].invImage + '.png) center no-repeat');
                            }

                            //$log.debug('invbar: images: ', images);

                            return {
                                klass: slot,
                                css: {
                                    background: images.join(','),
                                    'image-rendering': 'pixelated'
                                },
                                contents: inventory[slot]
                            };
                        });
                    };

                    inventorySystem.onEquipItem.add(changeHandler);
                    inventorySystem.onUnEquipItem.add(changeHandler);
                    inventorySystem.onItemAdded.add(changeHandler);
                    inventorySystem.onItemRemoved.add(changeHandler);

                    this.useSlot = function(slot) {
                        $log.debug('use slot: ', slot, 'this: ', this);
                        if (slot.klass.search(/slot/) === 0 && slot.contents) {
                            inventorySystem.equipItem(this.forEntity, slot.klass);
                        } else {
                            // for now this is all we will do, later other usage
                            inventorySystem.unequipItem(this.forEntity, slot.klass);
                        }
                    };

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
