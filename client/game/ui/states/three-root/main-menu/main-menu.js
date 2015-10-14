angular
    .module('game.ui.states.three-root.main-menu', [
        'ui.router',
        'angular-meteor',
        'game.ui.states.three-root.main-menu.enter-world',
        'game.ui.states.three-root.main-menu.create-char',
        'game.ui.states.three-root.main-menu.login',
        'game.ui.states.three-root.main-menu.register',
        'game.ui.states.three-root.main-menu.buy',
        'game.ui.states.three-root.main-menu.switch-server',
        'game.services.globalsound',
        'game.world-root',
        'engine.entity-builder',
        'engine.entity-cache',
        'engine.util',
        'global.constants'
    ])
    .config(['$stateProvider', function($stateProvider) {
        'use strict';

        var camera = null;

        $stateProvider.state('three-root.main-menu', {
            templateUrl: 'client/game/ui/states/three-root/main-menu/main-menu.ng.html',
            abstract: true,
            controllerAs: 'mainMenu',
            controller: [
                '$log',
                '$scope',
                'IB_CONSTANTS',
                'IbUtils',
                '$meteor',
                function($log, $scope, IB_CONSTANTS, IbUtils, $meteor) {

                    $scope.$meteorSubscribe('servers');

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
                '$log',
                'GlobalSound',
                '$timeout',
                '$rootScope',
                'IB_CONSTANTS',
                'EntityBuilder',
                '$window',
                '$entityCache',
                function($rootWorld, $log, GlobalSound, $timeout, $rootScope, IB_CONSTANTS, EntityBuilder, $window, $entityCache) {

                    $entityCache.put('mainPlayer', null);
                    $rootScope.mainPlayer = null;
                    $rootWorld.clearNetworkEntities();

                    delete $rootScope.isTransitioning;

                    $rootWorld.load(IB_CONSTANTS.world.mainMenuLevel).then(function () {
                        GlobalSound.play('theme', null, 5);
                    });

                    if (!camera) {
                        $rootWorld.renderer.setSize($window.innerWidth, $window.innerHeight);

                        camera = EntityBuilder.build('MainCamera', {
                            components: {
                                camera: {
                                    aspectRatio: $rootWorld.renderer.domElement.width / $rootWorld.renderer.domElement.height
                                },
                                script: {
                                    scripts: [
                                        '/scripts/built-in/character-multicam.js',
                                    ]
                                }
                            }
                        });

                        $entityCache.put('mainCamera', camera);

                        $rootWorld.addEntity(camera);
                    }
                }
            ],
            onExit: [
                '$rootWorld',
                'GlobalSound',
                '$timeout',
                function($rootWorld, GlobalSound, $timeout) {
                    GlobalSound.stop('theme');
                }
            ]
        });
    }]);
