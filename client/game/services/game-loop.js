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
        'Timer',
        '$rootScope',
        function($timing, $rootWorld, $window, IB_CONSTANTS, Timer, $rootScope) {
            'use strict';

            var uiTimer = new Timer(0.5);

            function onRequestedFrame() {
                $timing.step();

                if (IB_CONSTANTS.isDev) {
                    $rootWorld.stats.begin();

                    if ($rootWorld.__stats) {
                        $rootWorld.__stats('frame').start();
                        $rootWorld.__glStats.start();

                        $rootWorld.__stats('frame').start();
                        $rootWorld.__stats('rAF').tick();
                        $rootWorld.__stats('FPS').frame();

                        $rootWorld.__stats('render').start();

                        $rootWorld.__stats('render').end();

                        $rootWorld.__stats('frame').end();
                        $rootWorld.__stats().update();
                    }
                }

                $rootWorld.update($timing.frameTime, $timing.elapsed, $timing.timestamp);

                if (IB_CONSTANTS.isDev) {
                    $rootWorld.stats.end();

                    if ($rootWorld.__stats) {
                        $rootWorld.__stats('render').end();

                        $rootWorld.__stats('frame').end();
                        $rootWorld.__stats().update();
                    }

                    debug.clear();

                    debug.watch('scene.children.length', $rootWorld.scene.children.length);
                }

                if (uiTimer.isExpired) {
                    $rootScope.$apply();
                    uiTimer.reset();
                }

                $window.requestAnimationFrame(onRequestedFrame);
            }

            $window.requestAnimationFrame(onRequestedFrame);
        }
    ]);
