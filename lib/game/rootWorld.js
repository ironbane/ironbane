// serves as the "main" world for the game system
angular
    .module('game.world-root', [
        'game.threeWorld'
    ])
    .service('$rootWorld', [
        'ThreeWorld',
        function(ThreeWorld) {
            'use strict';

            var _world = new ThreeWorld();

            return _world;
        }
    ]);
