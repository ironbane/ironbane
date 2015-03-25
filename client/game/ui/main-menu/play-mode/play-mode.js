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

		        $scope.entities = $meteor.collection(function() {
		        	var user = Meteor.user();
					return Entities.find({
						owner: user._id
					});
				});

                $scope.play = function() {
                    GameService.enterGame($scope.nickname);
                };
            }]
        });
    }]);
