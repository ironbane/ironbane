angular
    .module('game.ui.main-menu', [
        'ui.router',
        'game.ui.main-menu.play-mode',
        'game.ui.main-menu.server-select',
        'game.ui.main-menu.level-select'
    ])
    .config(function ($stateProvider) {
        'use strict';

        $stateProvider.state('main-menu', {
            templateUrl: 'client/game/ui/main-menu/main-menu.ng.html',
            abstract: true,
            resolve: {
                // pass thru injection for onEnter/onExit events
                GameService: function (GameService) {
                    return GameService;
                }
            },
            controller: function($rootScope) {
                // for now we need to force them to remain in this state
                // TODO: tear down the scene on transition and/or allow for some play sub states
                $rootScope.$on('$stateChangeStart', function(e) {
                    // e.preventDefault();
                });
            },
            onEnter: function (GameService) {
                GameService.start();
            },
            onExit: function (GameService) {
                // TODO: shut down world
            }
        });
    });
