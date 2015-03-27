angular
	.module('game.ui.main-menu.register', [
		'engine.util',
		'ui.router'
	])
	.config(['$stateProvider', function ($stateProvider) {
		'use strict';

		$stateProvider.state('main-menu.register', {
			templateUrl: 'client/game/ui/main-menu/register/register.ng.html',
			controller: ['$scope', '$state', 'Util', function ($scope, $state, Util) {

				$scope.register = function() {
					Accounts.createUser({
						username: $scope.username,
						password: $scope.password,
						email: $scope.email
					}, function (err) {
						if (err) {
							throw err;
						}
						else {
							$state.go('main-menu.enter-world');
						}
					});
					// GameService.enterGame($scope.nickname);
				};

				$scope.cancel = function () {
					$state.go('main-menu.enter-world');
				};

				$scope.showPassword = Util.isMobile();
			}]
		});
	}]);
