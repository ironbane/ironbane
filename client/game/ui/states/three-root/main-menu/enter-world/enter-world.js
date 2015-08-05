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
                function($scope, $state, $meteor, CharBuilder, dialogService,
                    FantasyNameGenerator, IB_CONSTANTS, $log) {

                    var updateCharacterPreview = function() {
                        if ($scope.characters.length && $scope.currentCharIndex < $scope.characters.length) {
                            var currentChar = $scope.characters[$scope.currentCharIndex],
                                charOptions = {};

                            $log.debug('char preview: ', currentChar);

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
                                $scope.charPrevImg = url;
                            });
                        }
                    };

                    $scope.$watch('characters.length', function() {
                        updateCharacterPreview();

                        $scope.freeSlots = IB_CONSTANTS.rules.maxCharactersAllowed - $scope.characters.length;
                    });

                    var enterGame = function(charId) {
                        // We need to first change to playmode so network.js can test whether
                        // we are already playing, and add the player as a normal entity instead
                        // of one with special player components. Should this fail (e.g. we are already logged in)
                        // we'll just go back to our lastState.
                        var lastState = $state.current.name;
                        $state.go('three-root.play');

                        $meteor.call('enterGame', charId)
                            .then(function() {
                                var activeChar = _.find($scope.characters, function(character) {
                                    if (character._id === charId) {
                                        //$scope.currentCharIndex = index;
                                        return character;
                                    }
                                });

                                if (activeChar) {
                                    $scope.currentChar.id = charId;
                                    Session.set('activeLevel', activeChar.level);
                                } else {
                                    $log.error('unable to locate character, not updated yet?');
                                }
                            }, function(err) {
                                if (err) {
                                    $state.go(lastState);
                                    dialogService.alert(err.reason);
                                }
                            });

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
