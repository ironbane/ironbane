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
        'game.constants'
    ])
    .config(['$stateProvider', function($stateProvider) {
        'use strict';

        $stateProvider.state('three-root.main-menu', {
            templateUrl: 'client/game/ui/states/three-root/main-menu/main-menu.ng.html',
            abstract: true,
            resolve: {
                entitiesSubscription: [
                    '$meteor',
                    function($meteor) {
                        return $meteor.subscribe('entities');
                    }
                ],
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
                ]
            },
            onEnter: [
                '$rootWorld',
                'MainMenuPanningCamera',
                'IB_CONSTANTS',
                '$log',
                function($rootWorld, MainMenuPanningCamera, IB_CONSTANTS, $log) {
                    $log.debug('enter main menu state');
                    Session.set('activeLevel', IB_CONSTANTS.world.mainMenuLevel);

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
