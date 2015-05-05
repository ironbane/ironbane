angular
    .module('game.ui.states.three-root.main-menu', [
        'ui.router',
        'angular-meteor',
        'game.ui.states.three-root.main-menu.enter-world',
        'game.ui.states.three-root.main-menu.create-char',
        'game.ui.states.three-root.main-menu.login',
        'game.ui.states.three-root.main-menu.register',
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
                    function($rootWorld, EntityBuilder) {
                        var camera;

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
                ],
                characterList: [
                    '$meteor',
                    '$log',
                    'Util',
                    function($meteor, $log, Util) {
                        return Util.waitForMeteorGuestUserLogin().then(function(user) {
                            var list;
                            try {
                                list = $meteor.collection(function() {
                                    return $meteor.getCollectionByName('entities').find({
                                        owner: user._id
                                    });
                                }, false);
                            } catch (ex) {
                                $log.debug('caught: ex ', ex);
                            }

                            return list;
                        });
                    }
                ]
            },
            controllerAs: 'mainMenu',
            controller: [
                '$log',
                '$scope',
                'characterList',
                'IB_CONSTANTS',
                function($log, $scope, characterList, IB_CONSTANTS) {
                    $scope.characters = characterList;

                    $scope.currentCharIndex = 0;
                    angular.forEach($scope.characters, function(char, index) {
                        if (char._id === $scope.currentChar.id) {
                            $scope.currentCharIndex = index;
                        }
                    });

                    $scope.activeLevel = IB_CONSTANTS.world.mainMenuLevel;

                    $log.debug('mainMenu Controller: ', this, $scope);
                }
            ],
            onEnter: [
                '$rootWorld',
                'MainMenuPanningCamera',
                '$log',
                function($rootWorld, MainMenuPanningCamera, $log) {
                    $log.debug('mainMenu onEnter: ', this);
                    $rootWorld.addEntity(MainMenuPanningCamera);
                }
            ],
            onExit: [
                '$rootWorld',
                'MainMenuPanningCamera',
                function($rootWorld, MainMenuPanningCamera) {
                    $rootWorld.removeEntity(MainMenuPanningCamera);
                }
            ]
        });
    }]);
