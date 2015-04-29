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
        'util.name-gen',
        'game.world-root'
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
                '$rootWorld',
                function($scope, $state, $meteor, CharBuilder, dialogService,
                    FantasyNameGenerator, IB_CONSTANTS, $log, $rootWorld) {

                    var updateCharacterPreview = function() {
                        if ($scope.characters.length && $scope.currentCharIndex < $scope.characters.length) {
                            var currentChar = $scope.characters[$scope.currentCharIndex],
                                // testing here because of legacy db items TODO: update db?
                                skin = currentChar.components ? currentChar.components.quad.charBuildData.skin : currentChar.userData.skin,
                                hair = currentChar.components ? currentChar.components.quad.charBuildData.hair : currentChar.userData.hair,
                                eyes = currentChar.components ? currentChar.components.quad.charBuildData.eyes : currentChar.userData.eyes;
                            CharBuilder.makeChar({
                                skin: skin,
                                eyes: eyes,
                                hair: hair,
                            }).then(function(url) {
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
                                var activeChar = $scope.characters.reduce(function(prev, current, index) {
                                    if (current._id === charId) {
                                        //$scope.currentCharIndex = index;
                                        return current;
                                    }
                                });

                                if (activeChar) {
                                    $scope.currentChar.id = charId;
                                    // TODO: test in ZonesCollection that level still exists
                                    $rootWorld.activeLevel = activeChar.level;
                                    $log.debug('enterGame: ', activeChar, $scope);
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
