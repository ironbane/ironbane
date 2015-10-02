angular
    .module('engine.timing', [
        'ces'
    ])
    .factory('Timer', [
        'Class',
        '$timing',
        function(Class, $timing) {
            'use strict';

            var Timer = Class.extend({
                target: 0,
                base: 0,
                last: 0,
                pausedAt: 0,
                init: function(seconds) {
                    this.base = $timing.elapsed;
                    this.last = $timing.elapsed;

                    this.target = seconds || 0;
                },
                set: function(seconds) {
                    this.target = seconds || 0;
                    this.base = $timing.elapsed;
                    this.pausedAt = 0;
                },
                reset: function() {
                    this.base = $timing.elapsed;
                    this.pausedAt = 0;
                },
                tick: function() {
                    var delta = $timing.elapsed - this.last;
                    this.last = $timing.elapsed;
                    return (this.pausedAt ? 0 : delta);
                },
                pause: function() {
                    if (!this.pausedAt) {
                        this.pausedAt = $timing.elapsed;
                    }
                },
                unpause: function() {
                    if (this.pausedAt) {
                        this.base += $timing.elapsed - this.pausedAt;
                        this.pausedAt = 0;
                    }
                }
            });

            Object.defineProperties(Timer.prototype, {
                'delta': {
                    get: function() {
                        return (this.pausedAt || $timing.elapsed) - this.base - this.target;
                    },
                    enumerable: true
                },
                'isExpired': {
                    get: function() {
                        return this.delta > 0;
                    },
                    enumerable: true
                },
                'isPaused': {
                    get: function() {
                        return this.pausedAt > 0;
                    },
                    enumerable: true
                }
            });

            return Timer;
        }
    ])
    .service('$timing', [
        '$window',
        function($window) {
            'use strict';

            var _scale = 1.0;
            var _last = 0;
            var _maxStep = Meteor.isServer ? 1.0 : 0.05;

            this.startTime = new Date();

            this.elapsed = this.frameTime = Number.MIN_VALUE;

            this.step = function() {
                var current = $window.performance.now(),
                    frame = (current - _last) / 1000.0;

                this.timestamp = current;
                this.frameTime = Math.min(frame, _maxStep) * _scale;
                this.elapsed += this.frameTime;
                _last = current;
            };
        }
    ]);
