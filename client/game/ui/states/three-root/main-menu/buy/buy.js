angular
    .module('game.ui.states.three-root.main-menu.buy', [
        'game.ui.dialog',
        'global.constants',
        'ui.router',
        'models.accounts',
        'braintree-angular',
        'engine.char-builder'
    ])
    .config(["$stateProvider", function($stateProvider) {
        'use strict';

        $stateProvider.state('three-root.main-menu.buy', {
            templateUrl: 'client/game/ui/states/three-root/main-menu/buy/buy.ng.html',
            controller: ["$scope", "$rootScope", "$state", "dialogService", "IB_CONSTANTS", "CharBuilder", function($scope, $rootScope, $state, dialogService, IB_CONSTANTS, CharBuilder) {

                $scope.packs = IB_CONSTANTS.ironbloodPacks;
                $scope.selectedPack = null;
                $scope.purchaseStatus = 'idle';
                $rootScope.success = false;

                var options = {
                    singleUse: true,
                    currency: 'USD',
                    onPaymentMethodReceived: function (obj) {
                        if(!$rootScope.success) {
                            // Braintree calls onPaymentMethodReceived many times
                            // as we called setup() many times, likely because it wasn't
                            // designed with SPA's in mind. The only thing we can do
                            // is set a success flag here to minimize server calls
                            // and prevent a wrong purchaseStatus
                            // see http://stackoverflow.com/questions/30313753/braintree-multiple-setup-calls-yield-in-multiple-onpaymentmethodreceived-events
                            $scope.$apply(function() {
                                $rootScope.success = true;
                                $scope.purchaseStatus = 'verifying';

                                Meteor.call('createTransaction', {
                                    pack: $scope.selectedPack,
                                    nonce: obj.nonce
                                }, function (err, obj) {
                                    if (obj.success) {
                                        $scope.purchaseStatus = 'success';
                                    }
                                    else {
                                        $scope.purchaseStatus = 'error';
                                    }
                                });
                            });
                        }
                    }
                };

                $scope.getOptions = function () {
                    options.amount = $scope.packs[$scope.selectedPack].dollars;
                    return options;
                };

                $scope.back = function() {
                    $scope.purchaseStatus = 'idle';
                    $state.go('^.enter-world');
                };
            }]
        });
    }]);
