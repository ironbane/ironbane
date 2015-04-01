'use strict';

angular
    .module('Ironbane', [
        'angular-meteor',
        'game.ui',
        'game.game-loop',
        'game.network',
        'game.world-root',
        'ces',
        'three',
        'ammo',
        'ammo.physics-world',
        'components',
        'game.scripts',
        'game.prefabs',
        'engine.entity-builder',
        'engine.sound-system',
        'engine.ib-config',
        'engine.ib-constants',
        'engine.input.input-system',
        'engine.util',
        'engine.debugger',
        'util.deepExtend',
        'util.name-gen'
    ])
    .config(['SoundSystemProvider', '$locationProvider', function(SoundSystemProvider, $locationProvider) {

        // define all of the sounds & music for the game
        SoundSystemProvider.setAudioLibraryData({
            theme: {
                path: 'music/ib_theme',
                volume: 0.55,
                loop: true,
                type: 'music'
            }
        });

        $locationProvider.html5Mode(true);
    }])
    .config(['IbConfigProvider', function(IbConfigProvider) {
        IbConfigProvider.set('domElement', document);
    }])
    .run(['Debugger', '$window', function(Debugger, $window) {
        // for convenience
        $window.debug = Debugger;
    }])
    .run(['$window', '$rootWorld', function($window, $rootWorld) {
        // TODO: move to directive
        $rootWorld.renderer.setSize(window.innerWidth, window.innerHeight);
        document.body.appendChild($rootWorld.renderer.domElement);
        $rootWorld.renderer.setClearColor(0xd3fff8);

        $window.addEventListener('resize', function() {
            $rootWorld.renderer.setSize(window.innerWidth, window.innerHeight);
        }, false);
    }])
    .run(['$window', '$rootWorld', 'IbConstants', '$rootScope', function($window, $rootWorld, IbConstants, $rootScope) {
        $rootScope.IB_CONSTANTS = IbConstants;

        if (IbConstants.isDev) {
            $rootWorld.stats.setMode(0); // 0: fps, 1: ms

            // align top-left
            $rootWorld.stats.domElement.style.position = 'absolute';
            $rootWorld.stats.domElement.style.right = '0px';
            $rootWorld.stats.domElement.style.bottom = '0px';
            $rootWorld.stats.domElement.style.zIndex = 100;

            document.body.appendChild($rootWorld.stats.domElement);
        }
    }]);

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
