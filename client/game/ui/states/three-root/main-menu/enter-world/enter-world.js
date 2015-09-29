angular
    .module('game.ui.states.three-root.main-menu.enter-world', [
        'angular-meteor',
        'underscore',
        'ui.router',
        'engine.game-service',
        'engine.char-builder',
        'engine.util',
        'global.constants',
        'game.ui.dialog',
        'util.name-gen'
    ])
    .config(['$stateProvider', function($stateProvider) {
        'use strict';

        $stateProvider.state('three-root.main-menu.enter-world', {
            templateUrl: 'client/game/ui/states/three-root/main-menu/enter-world/enter-world.ng.html',
            controllerAs: 'enterWorld',
            controller: [
                '$scope',
                '$state',
                '$meteor',
                'CharBuilder',
                'dialogService',
                'FantasyNameGenerator',
                'IB_CONSTANTS',
                '$log',
                '$rootScope',
                function($scope, $state, $meteor, CharBuilder, dialogService,
                    FantasyNameGenerator, IB_CONSTANTS, $log, $rootScope) {

                    var updateCharacterPreview = function() {
                        if ($scope.characters.length && $scope.currentCharIndex < $scope.characters.length) {
                            var currentChar = $scope.characters[$scope.currentCharIndex],
                                charOptions = {};

                            // $log.debug('char preview: ', currentChar);

                            if (currentChar.components && currentChar.components.quad) {
                                charOptions.skin = currentChar.components.quad.charBuildData.skin;
                                charOptions.hair = currentChar.components.quad.charBuildData.hair;
                                charOptions.eyes = currentChar.components.quad.charBuildData.eyes;
                            } else {
                                charOptions.skin = currentChar.userData.skin;
                                charOptions.hair = currentChar.userData.hair;
                                charOptions.eyes = currentChar.userData.eyes;
                            }

                            if (currentChar.components && currentChar.components.inventory) {
                                var inventory = currentChar.components.inventory;
                                if (inventory.head) {
                                    charOptions.head = inventory.head.image;
                                }
                                if (inventory.body) {
                                    charOptions.body = inventory.body.image;
                                }
                                if (inventory.feet) {
                                    charOptions.feet = inventory.feet.image;
                                }
                            }

                            CharBuilder.makeChar(charOptions).then(function(url) {
                                return CharBuilder.getSpriteSheetTile(url, 1, 4, 3, 8);
                            }).then(function (url) {
                                $scope.charPrevImg = url;
                            });
                        }
                    };

                    var charRefresh = function () {
                        if (!$scope.currentUser || !$scope.currentUser.profile) {
                            return;
                        }

                        updateCharacterPreview();

                        $scope.freeSlots = $scope.currentUser.profile.maxCharactersAllowed - $scope.characters.length;
                    };
                    $scope.$watch('characters.length', charRefresh);
                    $scope.$watch('currentUser.profile.maxCharactersAllowed', charRefresh);

                    var enterGame = function(charId) {
                        $rootScope.isTransitioning = true;
                        setTimeout(function () {
                            $meteor.call('enterGame', charId)
                                .then(function() {
                                    var activeChar = _.find($scope.characters, function(character) {
                                        if (character._id === charId) {
                                            //$scope.currentCharIndex = index;
                                            return character;
                                        }
                                    });

                                    delete $rootScope.isTransitioning;
                                    $state.go('three-root.play');

                                    if (activeChar) {
                                        $scope.currentChar.id = charId;
                                    } else {
                                        $log.error('unable to locate character, not updated yet?');
                                    }
                                }, function(err) {
                                    if (err) {
                                        dialogService.alert(err.reason);
                                    }
                                });
                        }, 1000);
                    };

                    $scope.play = function() {
                        var user = $scope.currentUser;

                        if (user.profile && user.profile.guest) {
                            $meteor.call('createChar', {
                                    charName: FantasyNameGenerator.generateName('mmo')
                                })
                                .then(function(charId) {
                                    enterGame(charId);
                                }, function(err) {
                                    if (err) {
                                        dialogService.alert(err.reason);
                                    }
                                });
                        } else {
                            var charId = $scope.characters[$scope.currentCharIndex]._id;
                            enterGame(charId);
                        }

                    };

                    $scope.login = function() {
                        $state.go('^.login');
                    };

                    $scope.register = function() {
                        $state.go('^.register');
                    };

                    $scope.createChar = function() {
                        $state.go('^.create-char');
                    };

                    $scope.buyCharSlot = function() {
                        dialogService.buy('Extra Character Slot', 'extraCharacterSlot')
                            .then(function() {

                            });
                    };

                    $scope.prevChar = function() {
                        $scope.currentCharIndex--;
                        if ($scope.currentCharIndex < 0) {
                            // Set it to the array length so we can use one extra step
                            // to show the user an option to make a character
                            $scope.currentCharIndex = $scope.characters.length;
                        }
                        updateCharacterPreview();
                    };

                    $scope.nextChar = function() {
                        $scope.currentCharIndex++;
                        if ($scope.currentCharIndex > $scope.characters.length) {
                            $scope.currentCharIndex = 0;
                        }
                        updateCharacterPreview();
                    };

                    $scope.deleteChar = function() {
                        // TODO: type the full name type confimation? and/or soft delete
                        dialogService.confirm('Delete character?', 'Delete')
                            .then(function() {
                                $meteor.getCollectionByName('entities').remove({
                                    _id: $scope.characters[$scope.currentCharIndex]._id
                                });
                            });
                    };
                }
            ]
        });
    }]);
