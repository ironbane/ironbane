angular
    .module('game.ui.states.three-root.main-menu.create-char', [
        'angular-meteor',
        'engine.game-service',
        'engine.char-builder',
        'engine.util',
        'global.constants',
        'game.ui.dialog',
        'underscore',
        'ui.router'
    ])
    .config([
        '$stateProvider',
        function($stateProvider) {
            'use strict';

            $stateProvider.state('three-root.main-menu.create-char', {
                templateUrl: 'client/game/ui/states/three-root/main-menu/create-char/create-char.ng.html',
                controllerAs: 'createChar',
                controller: [
                    '$scope',
                    '$state',
                    'GameService',
                    'CharBuilder',
                    'IbUtils',
                    '_',
                    'IB_CONSTANTS',
                    '$meteor',
                    'dialogService',
                    '$log',
                    function($scope, $state, GameService, CharBuilder, IbUtils, _, IB_CONSTANTS, $meteor, dialogService, $log) {

                        $scope.back = function() {
                            $state.go('^.enter-world');
                        };

                        $scope.makeChar = function() {
                            var gender = $scope.boy ? 'male' : 'female';
                            var options = {
                                charName: $scope.charName,
                                boy: $scope.boy,
                                skin: IB_CONSTANTS.characterParts[gender].skin[$scope.skinIndex],
                                eyes: IB_CONSTANTS.characterParts[gender].eyes[$scope.eyesIndex],
                                hair: IB_CONSTANTS.characterParts[gender].hair[$scope.hairIndex],
                            };

                            $meteor.call('createChar', options)
                                .then(function(result) {
                                    // $log.debug('createChar result: ', result);
                                    $scope.currentCharId = result;
                                    $state.go('^.enter-world');
                                }, function(err) {
                                    if (err) {
                                        dialogService.alert(err.reason);
                                    }
                                });
                        };

                        // Character creation
                        var updateCharacterPreview = function() {
                            var gender = $scope.boy ? 'male' : 'female';

                            // Make sure the attributes are correct
                            if ($scope.skinIndex >= IB_CONSTANTS.characterParts[gender].skin.length) {
                                $scope.skinIndex = 0;
                            } else if ($scope.skinIndex < 0) {
                                $scope.skinIndex = IB_CONSTANTS.characterParts[gender].skin.length - 1;
                            }

                            if ($scope.eyesIndex >= IB_CONSTANTS.characterParts[gender].eyes.length) {
                                $scope.eyesIndex = 0;
                            } else if ($scope.eyesIndex < 0) {
                                $scope.eyesIndex = IB_CONSTANTS.characterParts[gender].eyes.length - 1;
                            }

                            if ($scope.hairIndex >= IB_CONSTANTS.characterParts[gender].hair.length) {
                                $scope.hairIndex = 0;
                            } else if ($scope.hairIndex < 0) {
                                $scope.hairIndex = IB_CONSTANTS.characterParts[gender].hair.length - 1;
                            }

                            CharBuilder.makeChar({
                                skin: IB_CONSTANTS.characterParts[gender].skin[$scope.skinIndex],
                                eyes: IB_CONSTANTS.characterParts[gender].eyes[$scope.eyesIndex],
                                hair: IB_CONSTANTS.characterParts[gender].hair[$scope.hairIndex],
                            }).then(function(url) {
                                return CharBuilder.getSpriteSheetTile(url, 1, 4, 3, 8);
                            }).then(function (url) {
                                $scope.charPrevImg = url;
                            });
                        };

                        $scope.boy = IbUtils.getRandomInt(0, 1) ? true : false;
                        var gender = $scope.boy ? 'male' : 'female';
                        $scope.skinIndex = IbUtils.getRandomInt(0, IB_CONSTANTS.characterParts[gender].skin.length - 1);
                        $scope.eyesIndex = IbUtils.getRandomInt(0, IB_CONSTANTS.characterParts[gender].eyes.length - 1);
                        $scope.hairIndex = IbUtils.getRandomInt(0, IB_CONSTANTS.characterParts[gender].hair.length - 1);

                        $scope.nextSkin = function() {
                            $scope.skinIndex++;
                            updateCharacterPreview();
                        };

                        $scope.prevSkin = function() {
                            $scope.skinIndex--;
                            updateCharacterPreview();
                        };

                        $scope.nextEyes = function() {
                            $scope.eyesIndex++;
                            updateCharacterPreview();
                        };

                        $scope.prevEyes = function() {
                            $scope.eyesIndex--;
                            updateCharacterPreview();
                        };

                        $scope.nextHair = function() {
                            $scope.hairIndex++;
                            updateCharacterPreview();
                        };

                        $scope.prevHair = function() {
                            $scope.hairIndex--;
                            updateCharacterPreview();
                        };

                        updateCharacterPreview();

                        $scope.toggleGender = function() {
                            $scope.boy = !$scope.boy;
                            updateCharacterPreview();
                        };

                        $scope.charParts = IB_CONSTANTS.characterParts;

                    }
                ]
            });
        }
    ]);
