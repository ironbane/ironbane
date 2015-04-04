angular
    .module('game.ui.states.three-root.main-menu', [
        'ui.router',
        'game.ui.states.three-root.main-menu.enter-world',
        'game.ui.states.three-root.main-menu.create-char',
        'game.ui.states.three-root.main-menu.login',
        'game.ui.states.three-root.main-menu.register',
        'game.world-root',
        'engine.entity-builder'
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
                ]
            },
            onEnter: [
                '$rootWorld',
                'MainMenuPanningCamera',
                function($rootWorld, MainMenuPanningCamera) {
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
