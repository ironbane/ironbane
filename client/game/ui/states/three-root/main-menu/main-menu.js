angular
    .module('game.ui.states.three-root.main-menu', [
        'ui.router',
        'angular-meteor',
        'game.ui.states.three-root.main-menu.enter-world',
        'game.ui.states.three-root.main-menu.create-char',
        'game.ui.states.three-root.main-menu.login',
        'game.ui.states.three-root.main-menu.register',
        'game.services.globalsound',
        'game.world-root',
        'engine.entity-builder',
        'engine.util',
        'global.constants'
    ])
    .config(['$stateProvider', function($stateProvider) {
        'use strict';

        $stateProvider.state('three-root.main-menu', {
            templateUrl: 'client/game/ui/states/three-root/main-menu/main-menu.ng.html',
            abstract: true,
            resolve: {
                MainMenuPanningCamera: [
                    '$rootWorld',
                    'EntityBuilder',
                    '$window',
                    function($rootWorld, EntityBuilder, $window) {
                        var camera;

                        // Problem: aspectRatio is set to 2 at this point because
                        // domElement is not set to the windowSize yet. Ideally, the MainMenuPanningCamera
                        // should be constructed AFTER entering three-root OnEnter, as it only knows about
                        // the real domElement size there.
                        // For now we'll just set the $window size here, but it's a hack really.
                        $rootWorld.renderer.setSize($window.innerWidth, $window.innerHeight);

                        camera = EntityBuilder.build('MainMenuPanningCamera', {
                            components: {
                                camera: {
                                    aspectRatio: $rootWorld.renderer.domElement.width / $rootWorld.renderer.domElement.height
                                },
                                script: {
                                    scripts: [
                                        '/scripts/built-in/camera-pan.js'
                                    ]
                                }
                            }
                        });

                        return camera;
                    }
                ]
            },
            controllerAs: 'mainMenu',
            controller: [
                '$log',
                '$scope',
                'IB_CONSTANTS',
                'IbUtils',
                '$meteor',
                function($log, $scope, IB_CONSTANTS, IbUtils, $meteor) {

                    $scope.characters = [];

                    $meteor.autorun($scope, function() {
                        var user = Meteor.user();
                        IbUtils.waitForMeteorGuestUserLogin().then(function(user) {
                            $scope.characters = $meteor.collection(function() {
                                return $meteor.getCollectionByName('entities').find({
                                    owner: user._id
                                });
                            }, false);
                        });
                    });

                    $scope.currentCharIndex = 0;
                    angular.forEach($scope.characters, function(character, index) {
                        if (character._id === $scope.currentChar.id) {
                            $scope.currentCharIndex = index;
                        }
                    });

                    // $log.debug('mainMenu Controller: ', this, $scope);
                }
            ],
            onEnter: [
                '$rootWorld',
                'MainMenuPanningCamera',
                '$log',
                'GlobalSound',
                '$timeout',
                function($rootWorld, MainMenuPanningCamera, $log, GlobalSound, $timeout) {
                    $log.debug('mainMenu onEnter: ', this);
                    $rootWorld.addEntity(MainMenuPanningCamera);

                    $timeout(function () {
                        GlobalSound.play('theme', 5);
                    }, 1000);
                }
            ],
            onExit: [
                '$rootWorld',
                'MainMenuPanningCamera',
                'GlobalSound',
                '$timeout',
                function($rootWorld, MainMenuPanningCamera, GlobalSound, $timeout) {
                    $rootWorld.removeEntity(MainMenuPanningCamera);

                    $timeout(function () {
                        GlobalSound.stop('theme');
                    }, 1000);
                }
            ]
        });
    }]);
