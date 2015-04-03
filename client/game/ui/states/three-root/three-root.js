angular
    .module('game.ui.states.three-root', [
        'ui.router',
        'angular-meteor',
        'game.ui.directives',
        'game.ui.states.three-root.play',
        'game.ui.states.three-root.main-menu'
    ])
    .config(['$stateProvider', function($stateProvider) {
        'use strict';

        // currently unused, the purpose of splitting is to allow a non-canvas view
        // (perhaps admin page)

        $stateProvider.state('three-root', {
            abstract: true,
            templateUrl: 'client/game/ui/states/three-root/three-root.ng.html',
            controller: [
                '$meteor',
                '$scope',
                function($meteor, $scope) {
                    $scope.logout = $meteor.logout;
                }
            ],
            onEnter: [
                '$rootWorld',
                '$rootScope',
                '$state',
                '$window',
                'GameService',
                function($rootWorld, $rootScope, $state, $window, GameService) {
                    $rootWorld.renderer.setSize($window.innerWidth, $window.innerHeight);
                    document.body.appendChild($rootWorld.renderer.domElement);
                    $rootWorld.renderer.setClearColor(0xd3fff8);

                    $window.addEventListener('resize', function() {
                        $rootWorld.renderer.setSize($window.innerWidth, $window.innerHeight);
                    }, false);

                    // this might also be a good directive
                    if ($rootScope.IB_CONSTANTS.isDev) {
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
