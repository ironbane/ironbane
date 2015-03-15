angular.module('game.game-loop', ['game.world-root', 'engine.debugger'])
    .run([
        '$rootWorld',
        '$window',
        'Debugger',
        function ($rootWorld, $window, Debugger) {
            'use strict';

            var startTime = $window.performance.now() / 1000.0;
            var lastTimestamp = startTime;
            var _timing = $rootWorld._timing;

            function onRequestedFrame() {
                var timestamp = $window.performance.now() / 1000.0;

                $window.requestAnimationFrame(onRequestedFrame);

                _timing.timestamp = timestamp;
                _timing.elapsed = timestamp - startTime;
                _timing.frameTime = timestamp - lastTimestamp;

                _timing.frameTime = Math.min(_timing.frameTime, 0.3);

                $rootWorld.update(_timing.frameTime, _timing.elapsed, _timing.timestamp);

                Debugger.tick(_timing.frameTime);

                lastTimestamp = timestamp;
            }

            $window.requestAnimationFrame(onRequestedFrame);
        }
    ]);
