'use strict';

angular
    .module('Ironbane', [
        'angular-meteor',
        'game.ui.states',
        'game.constants',
        'game.game-loop',
        'game.network',
        'game.world-root',
        'ces',
        'three',
        'ammo',
        'ammo.physics-world',
        'components',
        'game.systems',
        'game.scripts',
        'engine.entity-builder',
        'engine.sound-system',
        'engine.ib-config',
        'engine.input.input-system',
        'engine.util',
        'engine.debugger',
        'util.deepExtend',
        'util.name-gen'
    ])
    .config([
        '$locationProvider',
        'SoundSystemProvider',
        'IbConfigProvider',
        'InputSystemProvider',
        function($locationProvider, SoundSystemProvider, IbConfigProvider, InputSystemProvider) {
            $locationProvider.html5Mode(true);

            IbConfigProvider.set('domElement', document);

            // define all of the sounds & music for the game
            // TODO: load from a config file
            SoundSystemProvider.setAudioLibraryData({
                theme: {
                    path: 'music/ib_theme',
                    volume: 0.55,
                    loop: true,
                    type: 'music'
                }
            });

            // setup all input actions TODO: pull from config / local storage
            InputSystemProvider.setActionMapping('open-chat', [{
                type: 'keyboard',
                keys: ['ENTER'],
                check: 'pressed'
            }]);

            InputSystemProvider.setActionMapping('escape', [{
                type: 'keyboard',
                keys: ['ESC'],
                check: 'pressed'
            }]);
        }
    ])
    .run([
        '$window',
        'Debugger',
        'IB_CONSTANTS',
        '$rootScope',
        '$meteor',
        '$state',
        function($window, Debugger, IB_CONSTANTS, $rootScope, $meteor, $state) {
            // for convenience
            $window.debug = Debugger;

            // THIS IS WHERE IT ALL BEGINS!
            // NOTE: if we want to go to another state that isn't 3D, change logic here
            // maybe a router?
            $state.go('three-root.main-menu.enter-world');
        }
    ]);

function onReady() {
    // We must wait until Ammo is available! See comments in client/lib/lib/ammo.js
    // Hacky, but there is no other way for now.
    if (window.Ammo) {
        angular.bootstrap(document, ['Ironbane']);
    } else {
        setTimeout(onReady, 10);
    }
}

if (Meteor.isCordova) {
    angular.element(document).on('deviceready', onReady);
} else {
    angular.element(document).ready(onReady);
}
