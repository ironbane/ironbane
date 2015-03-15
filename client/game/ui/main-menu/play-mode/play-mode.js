angular
    .module('game.ui.main-menu.play-mode', [
        'ui.router'
    ])
    .config(function ($stateProvider) {
        'use strict';

        $stateProvider.state('main-menu.play-mode', {
            templateUrl: 'game/ui/main-menu/play-mode/play-mode.tpl.html',
            controller: function ($scope, $state) {
                $scope.playOnline = function() {
                    // TODO: go to server select, take mode out of url
                    $state.go('^.level-select', {mode: 'online'});
                };

                $scope.playOffline = function() {
                    $state.go('^.level-select', {mode: 'offline'});
                };
            }
        });
    });
