angular
    .module('game.ui.main-menu.play-mode', [
    	'angular-meteor',
    	'engine.game-service',
        'ui.router'
    ])
    .config(['$stateProvider', function ($stateProvider) {
        'use strict';

        $stateProvider.state('main-menu.play-mode', {
            templateUrl: 'client/game/ui/main-menu/play-mode/play-mode.ng.html',
            controller: ['$scope', '$state', 'GameService', '$meteor', function ($scope, $state, GameService, $meteor) {

            	$scope.currentCharacterIndex = 0;

		        $scope.entities = $meteor.collection(function() {
		        	var user = Meteor.user();
		        	console.log(user);
					return Entities.find({
						owner: user._id
					});
				});

                $scope.play = function() {
                    GameService.enterGame($scope.nickname);
                };

                $scope.login = function () {
					$state.go('main-menu.login');
                };

                $scope.register = function () {
				 	$state.go('main-menu.register');
                };

                // Character creation

                $scope.boy = true;

                $scope.toggleGender = function () {
                	$scope.boy = !$scope.boy;
                };

            }]
        });
    }]);
