angular
    .module('game.ui.states.three-root', [
        'ces',
        'ui.router',
        'angular-meteor',
        'global.constants',
        'game.ui.directives',
        'game.ui.states.three-root.play',
        'game.ui.states.three-root.main-menu',
        'game.world-root',
        'game.services.globalsound'
    ])
    .config(['$stateProvider', function($stateProvider) {
        'use strict';

        $stateProvider.state('three-root', {
            abstract: true,
            templateUrl: 'client/game/ui/states/three-root/three-root.ng.html',
            resolve: {
                entitiesSubscription: [
                    '$meteor',
                    function($meteor) {
                        return $meteor.subscribe('entities');
                    }
                ],
                'currentUser': [
                    '$meteor',
                    function($meteor) {
                        return $meteor.requireUser();
                    }
                ]
            },
            controllerAs: 'threeRoot',
            controller: [
                '$meteor',
                '$scope',
                '$log',
                'IB_CONSTANTS',
                '$rootWorld',
                '$state',
                '$timeout',
                'GlobalSound',
                function($meteor, $scope, $log, IB_CONSTANTS, $rootWorld, $state, $timeout, GlobalSound) {
                    this.IB_CONSTANTS = IB_CONSTANTS;

                    // make this an object so we keep the reference
                    $scope.currentChar = {
                        id: localStorage.getItem('lastCharId')
                    }; // TODO: wrap local storage, perhaps user profile instead

                    $scope.$watch('currentChar', function(char) {
                        // $log.debug('currentChar changed', char);
                        localStorage.setItem('lastCharId', char.id);
                    }, true);

                    $scope.levelLoaded = false;

                    $scope.IB_CONSTANTS = IB_CONSTANTS;
                    $scope.logout = function() {
                        return $meteor.logout()
                            .then(function() {
                                // Might need to be changed to waitForMeteorGuestUserLogin()
                                return $meteor.waitForUser();
                            })
                            .then(function(user) {
                                // $log.debug('logged out: ', user);
                                $state.go('three-root.main-menu.enter-world');
                            });
                    };

                    $scope.buy = function () {
                        $state.go('three-root.main-menu.buy');
                    };

                    $meteor.autorun($scope, function() {
                        var user = Meteor.user();

                        if (!user || user.profile.enableSound) {
                            GlobalSound.setMusicVolume(1);
                            GlobalSound.setSoundVolume(1);
                            // GlobalSound.unmute();
                        } else {
                            GlobalSound.setMusicVolume(0);
                            GlobalSound.setSoundVolume(0);
                            // GlobalSound.mute();
                        }
                    });

                    $scope.goToSwitchServerScreen = function() {
                        $state.go('three-root.main-menu.switch-server');
                    };

                    $scope.toggleSound = function() {
                        var user = Meteor.user();

                        $meteor.call('updateProfile', 'enableSound', !user.profile.enableSound);
                    };


                    $scope.$watch(function() {
                        return $rootWorld.loaded;
                    }, function(loaded) {
                        $scope.levelLoaded = loaded;
                    });
                }
            ],
            onEnter: [
                '$rootWorld',
                'IB_CONSTANTS',
                '$state',
                '$window',
                'GameService',
                function($rootWorld, IB_CONSTANTS, $state, $window, GameService) {
                    $rootWorld.renderer.setSize($window.innerWidth, $window.innerHeight);
                    document.body.appendChild($rootWorld.renderer.domElement);
                    $rootWorld.renderer.setClearColor(0xd3fff8);

                    $window.addEventListener('resize', function() {
                        $rootWorld.renderer.setSize($window.innerWidth, $window.innerHeight);
                    }, false);

                    // this might also be a good directive
                    if (IB_CONSTANTS.isDev) {
                        $rootWorld.stats.setMode(0); // 0: fps, 1: ms

                        // align top-left
                        $rootWorld.stats.domElement.style.position = 'absolute';
                        $rootWorld.stats.domElement.style.right = '0px';
                        $rootWorld.stats.domElement.style.bottom = '0px';
                        $rootWorld.stats.domElement.style.zIndex = 100;

                        document.body.appendChild($rootWorld.stats.domElement);

                        // setup rStats
                        // $rootWorld.__glStats = new glStats();
                        // $rootWorld.__stats = new rStats({
                        //     values: {
                        //         frame: {
                        //             caption: 'Total frame time (ms)',
                        //             over: 16
                        //         },
                        //         fps: {
                        //             caption: 'Framerate (FPS)',
                        //             below: 30
                        //         },
                        //         calls: {
                        //             caption: 'Calls (three.js)',
                        //             over: 3000
                        //         },
                        //         raf: {
                        //             caption: 'Time since last rAF (ms)'
                        //         },
                        //         rstats: {
                        //             caption: 'rStats update (ms)'
                        //         }
                        //     },
                        //     groups: [{
                        //         caption: 'Framerate',
                        //         values: ['fps', 'raf']
                        //     }, {
                        //         caption: 'Frame Budget',
                        //         values: ['frame', 'texture', 'setup', 'render']
                        //     }],
                        //     fractions: [{
                        //         base: 'frame',
                        //         steps: ['action1', 'render']
                        //     }],
                        //     plugins: [
                        //         new threeStats($rootWorld.renderer),
                        //         $rootWorld.__glStats,
                        //         new browserStats()
                        //     ]
                        // });
                    }

                    GameService.start();
                }
            ]
        });
    }]);
