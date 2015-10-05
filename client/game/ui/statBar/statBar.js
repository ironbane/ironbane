angular
    .module('game.ui.statBar', [])
    .directive('statBar', [
        '$log',
        function($log) {
            'use strict';

            var config = {
                restrict: 'E',
                templateUrl: 'client/game/ui/statBar/statBar.ng.html',
                scope: {
                    statComponent: '='
                },
                bindToController: true,
                controllerAs: 'statBar',
                controller: ['$scope', function($scope) {
                    var ctrl = this;

                    ctrl.icons = [];

                    $scope.$watchCollection(function() {
                        return ctrl.statComponent;
                    }, function(component, old) {
                        //$log.debug('statComponent changed: ', component, old);
                        ctrl.icons = [];
                        if (!component) {
                            return;
                        }

                        var totalFull = Math.ceil(component.max);
                        for (var i = totalFull; i >= 1; i--) {
                            var value = i;
                            if (component.value >= value) {
                                ctrl.icons.unshift({
                                    icon: i,
                                    css: 'sprite-' + component.name + '_full'
                                });
                            } else if (component.value >= value - 0.25) {
                                ctrl.icons.unshift({
                                    icon: i,
                                    css: 'sprite-' + component.name + '_3quarter'
                                });
                            } else if (component.value >= value - 0.5) {
                                ctrl.icons.unshift({
                                    icon: i,
                                    css: 'sprite-' + component.name + '_half'
                                });
                            } else if (component.value >= value - 0.75) {
                                ctrl.icons.unshift({
                                    icon: i,
                                    css: 'sprite-' + component.name + '_quarter'
                                });
                            } else {
                                ctrl.icons.unshift({
                                    icon: i,
                                    css: 'sprite-' + component.name + '_empty'
                                });
                            }
                        }
                    });
                }]
            };

            return config;
        }
    ]);
