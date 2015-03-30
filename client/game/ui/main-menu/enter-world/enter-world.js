angular
	.module('game.ui.main-menu.enter-world', [
		'angular-meteor',
		'underscore',
		'ui.router',
		'engine.game-service',
		'engine.char-builder',
		'engine.util',
		'engine.ib-constants',
		'game.ui.dialog',
		'util.name-gen'
	])
	.config(['$stateProvider', function ($stateProvider) {
		'use strict';

		$stateProvider.state('main-menu.enter-world', {
			templateUrl: 'client/game/ui/main-menu/enter-world/enter-world.ng.html',
			controller: ['$scope', '$state', 'GameService', '$meteor', 'CharBuilder', '$meteorUtils', 'dialogService', 'FantasyNameGenerator',
			function ($scope, $state, GameService, $meteor, CharBuilder, $meteorUtils, dialogService, FantasyNameGenerator) {

				$scope.currentCharacterIndex = 0;

				$scope.entities = $meteor.collection(function() {
					var user = Meteor.user();
					console.log(user);
					return $meteorUtils.getCollectionByName('entities').find({
						owner: user._id
					});
				}, false);

				var updateCharacterPreview = function () {
					if ($scope.entities.length && $scope.currentCharacterIndex < $scope.entities.length) {
						var currentChar = $scope.entities[$scope.currentCharacterIndex];
						CharBuilder.makeChar({
							skin: currentChar.components.quad.charBuildData.skin,
							eyes: currentChar.components.quad.charBuildData.eyes,
							hair: currentChar.components.quad.charBuildData.hair,
						}).then(function (url) {
							$scope.charPrevImg = url;
						});
					}
				};

				$scope.$watch('entities.length', function () {
					updateCharacterPreview();

					$scope.freeSlots = 5 - $scope.entities.length;
				});

				var enterGame = function (charId) {

					var activeChar = Entities.findOne({
						_id: charId
					});

					Session.set('activeLevel', activeChar.level);

					Entities.update({
						_id: charId
					}, {
						$set: {
							active: true
						}
					});
				};

				$scope.play = function () {
					var user = Meteor.user();

					if (user.profile && user.profile.guest) {
						$meteor.call('createChar', {
							charName: FantasyNameGenerator.generateName('mmo')
						})
						.then(function (charId) {
							$state.go('main-menu.enter-world');

							enterGame(charId);

						}, function (err) {
							if (err) {
								dialogService.alert(err.reason);
							}
						});
					}
					else {
						var charId = $scope.entities[$scope.currentCharacterIndex]._id;
						enterGame(charId);
					}

				};

				$scope.login = function () {
					$state.go('main-menu.login');
				};

				$scope.register = function () {
					$state.go('main-menu.register');
				};

				$scope.createChar = function () {
					$state.go('main-menu.create-char');
				};

				$scope.prevChar = function () {
					$scope.currentCharacterIndex--;
					if ($scope.currentCharacterIndex < 0) {
						// Set it to the array length so we can use one extra step
						// to show the user an option to make a character
						$scope.currentCharacterIndex = $scope.entities.length;
					}
					updateCharacterPreview();
				};

				$scope.nextChar = function () {
					$scope.currentCharacterIndex++;
					if ($scope.currentCharacterIndex > $scope.entities.length) {
						$scope.currentCharacterIndex = 0;
					}
					updateCharacterPreview();
				};

				$scope.deleteChar = function () {
					dialogService.confirm('Delete character?', 'Delete')
					.then(function () {
						Entities.remove({
							_id: $scope.entities[$scope.currentCharacterIndex]._id
						});
					});
				};


			}]
		});
	}]);
