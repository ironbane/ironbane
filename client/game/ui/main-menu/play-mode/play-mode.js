angular
    .module('game.ui.main-menu.play-mode', [
        'ui.router'
    ])
    .config(function ($stateProvider) {
        'use strict';

        $stateProvider.state('main-menu.play-mode', {
            templateUrl: 'client/game/ui/main-menu/play-mode/play-mode.ng.html',
            controller: function ($scope, $state) {
                $scope.play = function() {
                    // TODO: go to server select, take mode out of url
                    $state.go('play').then(function(){},function (err) {
                    	throw err;
                    });
                };
            }
        });
    });
