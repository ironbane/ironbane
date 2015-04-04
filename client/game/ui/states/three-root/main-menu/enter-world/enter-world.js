angular
    .module('game.ui.states.three-root.main-menu.enter-world', [
        'angular-meteor',
        'underscore',
        'ui.router',
        'engine.game-service',
        'engine.char-builder',
        'engine.util',
        'game.constants',
        'game.ui.dialog',
        'util.name-gen',
        'game.ui.chat.chatService'
    ])
    .config(['$stateProvider', function($stateProvider) {
        'use strict';

        $stateProvider.state('three-root.main-menu.enter-world', {
            templateUrl: 'client/game/ui/states/three-root/main-menu/enter-world/enter-world.ng.html',
            controller: [
                '$scope',
                '$state',
                '$meteor',
                'CharBuilder',
                'dialogService',
                'FantasyNameGenerator',
                'IB_CONSTANTS',
                'ChatService',
                function($scope, $state, $meteor, CharBuilder, dialogService,
                    FantasyNameGenerator, IB_CONSTANTS, ChatService) {

                    $scope.currentCharacterIndex = 0;

                    $scope.entities = $meteor.collection(function() {
                        var user = $scope.currentUser;
                        return $meteor.getCollectionByName('entities').find({
                            owner: user._id
                        });
                    }, false);

                    var updateCharacterPreview = function() {
                        if ($scope.entities.length && $scope.currentCharacterIndex < $scope.entities.length) {
                            var currentChar = $scope.entities[$scope.currentCharacterIndex];
                            CharBuilder.makeChar({
                                skin: currentChar.components.quad.charBuildData.skin,
                                eyes: currentChar.components.quad.charBuildData.eyes,
                                hair: currentChar.components.quad.charBuildData.hair,
                            }).then(function(url) {
                                $scope.charPrevImg = url;
                            });
                        }
                    };

                    $scope.$watch('entities.length', function() {
                        updateCharacterPreview();

                        $scope.freeSlots = IB_CONSTANTS.rules.maxCharactersAllowed - $scope.entities.length;
                    });

                    var enterGame = function(charId) {

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

                        ChatService.announce(activeChar.name + ' has entered the world.');
                    };

                    $scope.play = function() {
                        var user = Meteor.user();

                        if (user.profile && user.profile.guest) {
                            $meteor.call('createChar', {
                                    charName: FantasyNameGenerator.generateName('mmo')
                                })
                                .then(function(charId) {
                                    $state.go('^.enter-world');

                                    enterGame(charId);

                                }, function(err) {
                                    if (err) {
                                        dialogService.alert(err.reason);
                                    }
                                });
                        } else {
                            var charId = $scope.entities[$scope.currentCharacterIndex]._id;
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
                        $scope.currentCharacterIndex--;
                        if ($scope.currentCharacterIndex < 0) {
                            // Set it to the array length so we can use one extra step
                            // to show the user an option to make a character
                            $scope.currentCharacterIndex = $scope.entities.length;
                        }
                        updateCharacterPreview();
                    };

                    $scope.nextChar = function() {
                        $scope.currentCharacterIndex++;
                        if ($scope.currentCharacterIndex > $scope.entities.length) {
                            $scope.currentCharacterIndex = 0;
                        }
                        updateCharacterPreview();
                    };

                    $scope.deleteChar = function() {
                        dialogService.confirm('Delete character?', 'Delete')
                            .then(function() {
                                Entities.remove({
                                    _id: $scope.entities[$scope.currentCharacterIndex]._id
                                });
                            });
                    };
                }
            ]
        });
    }]);
