angular
    .module('game.ui.states.three-root', [
        'ui.router',
        'angular-meteor',
        'game.constants',
        'game.ui.directives',
        'game.ui.states.three-root.play',
        'game.ui.states.three-root.main-menu',
        'engine.level-loader',
        'game.constants',
        'game.world-root'
    ])
    .config(['$stateProvider', function($stateProvider) {
        'use strict';

        $stateProvider.state('three-root', {
            abstract: true,
            templateUrl: 'client/game/ui/states/three-root/three-root.ng.html',
            resolve: {
                'currentUser': [
                    '$meteor',
                    function($meteor) {
                        return $meteor.requireUser();
                    }
                ]
            },
            controller: [
                '$meteor',
                '$scope',
                '$log',
                'IB_CONSTANTS',
                'LevelLoader',
                '$rootWorld',
                function($meteor, $scope, $log, IB_CONSTANTS, LevelLoader, $rootWorld) {
                	$scope.IB_CONSTANTS = IB_CONSTANTS;
                    $scope.logout = $meteor.logout;

                    function clearOldLevel(level) {
                        var nodesToBeRemoved = [];

                        $rootWorld.traverse(function(node) {
                            if (node.doc && node.doc.level !== level) {
                                nodesToBeRemoved.push(node);
                            }
                        });

                        nodesToBeRemoved.forEach(function(node) {
                            $rootWorld.removeEntity(node);
                        });
                    }

                    $meteor.session('activeLevel').bind($scope, 'activeLevel');

                    $scope.$watch('activeLevel', function(level) {
                        $log.debug('activeLevel changed: ', level);

                        if (!angular.isString(level)) {
                            return;
                        }

                        clearOldLevel(level);

                        LevelLoader.load(level)
                            .catch(function(err) {
                                $log.debug('error loading level ', level, err);
                            });
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
                    }

                    GameService.start();
                }
            ]
        });
    }]);
