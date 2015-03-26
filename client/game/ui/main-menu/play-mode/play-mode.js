angular
    .module('game.ui.main-menu.play-mode', [
    	'angular-meteor',
    	'engine.game-service',
    	'engine.char-builder',
    	'engine.util',
    	'engine.ib-constants',
    	'underscore',
        'ui.router'
    ])
    .config(['$stateProvider', function ($stateProvider) {
        'use strict';

        $stateProvider.state('main-menu.play-mode', {
            templateUrl: 'client/game/ui/main-menu/play-mode/play-mode.ng.html',
            controller: ['$scope', '$state', 'GameService', '$meteor', 'CharBuilder', 'Util', '_', 'IbConstants', function ($scope, $state, GameService, $meteor, CharBuilder, Util, _, IbConstants) {

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
                var updateCharacterPreview = function () {
                	var gender = $scope.boy ? 'male' : 'female';

                	// Make sure the attributes are correct
                	if ($scope.skinIndex >= IbConstants.characterParts[gender].skin.length) {
                		$scope.skinIndex = 0;
                	}
                	else if ($scope.skinIndex < 0) {
                		$scope.skinIndex = IbConstants.characterParts[gender].skin.length-1;
                	}

                	if ($scope.eyesIndex >= IbConstants.characterParts[gender].eyes.length) {
                		$scope.eyesIndex = 0;
                	}
                	else if ($scope.eyesIndex < 0) {
                		$scope.eyesIndex = IbConstants.characterParts[gender].eyes.length-1;
                	}

                	if ($scope.hairIndex >= IbConstants.characterParts[gender].hair.length) {
                		$scope.hairIndex = 0;
                	}
                	else if ($scope.hairIndex < 0) {
                		$scope.hairIndex = IbConstants.characterParts[gender].hair.length-1;
                	}

	                CharBuilder.makeChar({
	                	skin: IbConstants.characterParts[gender].skin[$scope.skinIndex],
	                	eyes: IbConstants.characterParts[gender].eyes[$scope.eyesIndex],
	                	hair: IbConstants.characterParts[gender].hair[$scope.hairIndex],
	                }).then(function (url) {
						$scope.charPrevImg = url;
	                });
                };

				$scope.boy = Util.getRandomInt(0, 1) ? true : false;
				var gender = $scope.boy ? 'male' : 'female';
                $scope.skinIndex = Util.getRandomInt(0, IbConstants.characterParts[gender].skin.length-1);
                $scope.eyesIndex = Util.getRandomInt(0, IbConstants.characterParts[gender].eyes.length-1);
                $scope.hairIndex = Util.getRandomInt(0, IbConstants.characterParts[gender].hair.length-1);

                $scope.nextSkin = function () {
                	$scope.skinIndex++;
                	updateCharacterPreview();
                };

                $scope.prevSkin = function () {
                	$scope.skinIndex--;
                	updateCharacterPreview();
                };

                $scope.nextEyes = function () {
                	$scope.eyesIndex++;
                	updateCharacterPreview();
                };

                $scope.prevEyes = function () {
                	$scope.eyesIndex--;
                	updateCharacterPreview();
                };

                $scope.nextHair = function () {
                	$scope.hairIndex++;
                	updateCharacterPreview();
                };

                $scope.prevHair = function () {
                	$scope.hairIndex--;
                	updateCharacterPreview();
                };

                updateCharacterPreview();

                $scope.toggleGender = function () {
                	$scope.boy = !$scope.boy;
                	updateCharacterPreview();
                };

                $scope.charParts = IbConstants.characterParts;

            }]
        });
    }]);
