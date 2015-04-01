angular.module('game.game-loop', ['game.world-root', 'engine.debugger', 'engine.ib-constants'])
    .run([
        '$rootWorld',
        '$window',
        'Debugger',
        'IbConstants',
        function ($rootWorld, $window, Debugger, IbConstants) {
            'use strict';

            var startTime = $window.performance.now() / 1000.0;
            var lastTimestamp = startTime;
            var _timing = $rootWorld._timing;

            function onRequestedFrame() {
                var timestamp = $window.performance.now() / 1000.0;

                _timing.timestamp = timestamp;
                _timing.elapsed = timestamp - startTime;
                _timing.frameTime = timestamp - lastTimestamp;

                _timing.frameTime = Math.min(_timing.frameTime, 0.3);

                if (IbConstants.isDev) {
                	$rootWorld.stats.begin();
                }

                $rootWorld.update(_timing.frameTime, _timing.elapsed, _timing.timestamp);

                Debugger.tick(_timing.frameTime);

				if (IbConstants.isDev) {
                	$rootWorld.stats.end();
                }

                lastTimestamp = timestamp;

                $window.requestAnimationFrame(onRequestedFrame);
            }

            $window.requestAnimationFrame(onRequestedFrame);
        }
    ]);
