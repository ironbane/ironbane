angular
	.module('game.ui.main-menu.register', [
		'ui.router'
	])
	.config(['$stateProvider', function ($stateProvider) {
		'use strict';

		$stateProvider.state('main-menu.register', {
			templateUrl: 'client/game/ui/main-menu/register/register.ng.html',
			controller: ['$scope', '$state', function ($scope, $state) {

				$scope.register = function() {
					// GameService.enterGame($scope.nickname);
				};

				$scope.cancel = function () {
					$state.go('main-menu.play-mode');
				}
			}]
		});
	}]);
