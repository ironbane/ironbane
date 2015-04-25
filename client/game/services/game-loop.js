angular
    .module('game.game-loop', [
        'engine.timing',
        'game.world-root',
        'global.constants'
    ])
    .run([
        '$timing',
        '$rootWorld',
        '$window',
        'IB_CONSTANTS',
        function($timing, $rootWorld, $window, IB_CONSTANTS) {
            'use strict';

            function onRequestedFrame() {
                $timing.step();

                if (IB_CONSTANTS.isDev) {
                    $rootWorld.stats.begin();
                }

                $rootWorld.update($timing.frameTime, $timing.elapsed, $timing.timestamp);

                if (IB_CONSTANTS.isDev) {
                    $rootWorld.stats.end();
                }

                $window.requestAnimationFrame(onRequestedFrame);
            }

            $window.requestAnimationFrame(onRequestedFrame);
        }
    ]);
