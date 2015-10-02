angular
    .module('game.ui.dialog', [
        'ui.bootstrap',
        'global.constants',
        'angular-meteor',
        'ngSanitize'
    ])
    .service('dialogService', [
        '$modal',
        'IB_CONSTANTS',
        function($modal, IB_CONSTANTS) {
            'use strict';

            // Exampe usage:
            //
            // dialogService.alert('Holy cow!')
            // .then(function () {
            //  console.log(arguments);
            //  return dialogService.confirm('Is Ironbane awesome or what?');
            // })
            // .then(function () {
            //  console.log(arguments);
            //  return dialogService.prompt('Favorite color?');
            // })
            // .then(function () {
            //  console.log(arguments);
            // })

            var self = this;

            self.alert = function(content, okText, headerText) {
                return $modal.open({
                    templateUrl: 'client/game/ui/dialog/alertDialog.ng.html',
                    controller: ['$scope', '$modalInstance', function($scope, $modalInstance) {
                        $scope.content = content;
                        $scope.okText = okText || 'Okay';
                        $scope.headerText = headerText;

                        $scope.ok = function() {
                            $modalInstance.close(true);
                        };
                    }],
                    size: 'sm'
                }).result;
            };

            self.confirm = function(content, okText, cancelText) {
                return $modal.open({
                    templateUrl: 'client/game/ui/dialog/confirmDialog.ng.html',
                    controller: ['$scope', '$modalInstance', function($scope, $modalInstance) {
                        $scope.content = content;
                        $scope.okText = okText || 'Okay';
                        $scope.cancelText = cancelText || 'Cancel';
                        $scope.ok = function() {
                            $modalInstance.close(true);
                        };
                        $scope.cancel = function() {
                            $modalInstance.dismiss('cancel');
                        };
                    }],
                    size: 'sm'
                }).result;
            };

            self.prompt = function(content, okText, cancelText) {
                return $modal.open({
                    templateUrl: 'client/game/ui/dialog/promptDialog.ng.html',
                    controller: ['$scope', '$modalInstance', function($scope, $modalInstance) {
                        $scope.placeholderText = content;
                        $scope.okText = okText || 'Okay';
                        $scope.cancelText = cancelText || 'Cancel';
                        $scope.result = {};
                        $scope.ok = function() {
                            $modalInstance.close($scope.result.prompt);
                        };
                        $scope.cancel = function() {
                            $modalInstance.dismiss('cancel');
                        };
                    }]
                }).result;
            };

            self.buy = function(itemLabel, itemName) {
                return $modal.open({
                    templateUrl: 'client/game/ui/dialog/buyDialog.ng.html',
                    controller: ['$scope', '$modalInstance', '$meteor', '$state', function($scope, $modalInstance, $meteor, $state) {
                        $scope.price = IB_CONSTANTS.ironbloodRates[itemName];
                        $scope.itemLabel = itemLabel;
                        $scope.result = {};
                        $scope.transactionInProgress = false;
                        $scope.buy = function() {
                            $scope.transactionInProgress = true;
                            $meteor.call('buyItem', itemName)
                                .then(function(result) {
                                    self.alert('Success!')
                                        .then(function() {
                                            $modalInstance.dismiss('cancel');
                                        });
                                }, function(result) {
                                    if (result.error === 'not-enough-ironblood') {
                                        self.confirm('You don\'t have enough Ironblood. Would you like to buy some?')
                                            .then(function() {
                                                $modalInstance.dismiss('cancel');
                                                $state.go('three-root.main-menu.buy');
                                            }, function() {
                                                $modalInstance.dismiss('cancel');
                                            });
                                    }
                                });
                        };
                        $scope.cancel = function() {
                            $modalInstance.dismiss('cancel');
                        };
                    }]
                }).result;
            };

        }
    ]);
