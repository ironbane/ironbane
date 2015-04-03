angular
    .module('game.main-menu', [
        'ces',
        'three',
        'angular-meteor',
        'ui.router',
        'game.world-root',
        'engine.entity-builder',
        'engine.util'
    ])
    .run([
        'World',
        'THREE',
        '$log',
        'EntityBuilder',
        '$rootWorld',
        '$state',
        '$meteor',
        '$rootScope',
        function(World, THREE, $log, EntityBuilder, $rootWorld, $state, $meteor, $rootScope) {
            'use strict';

            var mainMenuPanningCamera = null;
            var getMainMenuPanningCamera = function() {
                if (!mainMenuPanningCamera) {
                    mainMenuPanningCamera = EntityBuilder.build('MainMenuPanningCamera', {
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
                }

                return mainMenuPanningCamera;
            };

            var addMainMenuCamera = function() {
                $rootWorld.addEntity(getMainMenuPanningCamera());
            };

            var removeMainMenuCamera = function() {
                $rootWorld.removeEntity(getMainMenuPanningCamera());
            };

            $meteor.waitForUser()
                .then(function(currentUser) {
                    $meteor.autorun($rootScope, function() {
                        var characters = Entities.find({
                            owner: currentUser._id,
                            active: true
                        });

                        if (characters.count() === 0) {
                            $state.go('main-menu.enter-world');
                            addMainMenuCamera();
                        } else {
                            $state.go('play');
                            removeMainMenuCamera();
                        }
                    });
                });
        }
    ]);
