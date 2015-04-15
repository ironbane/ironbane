angular
    .module('engine.util', [])
    .service('ibUtils', [
        function() {
            'use strict';

            var _sequencedTimers = {};

            // TODO: descriptive var names
            this.chooseFromSequence = function(a) {
                var uid = '';
                for (var b in a) {
                    uid += b;
                }
                if (angular.isUndefined(_sequencedTimers[uid])) {
                    _sequencedTimers[uid] = 0;
                }
                var value = a[_sequencedTimers[uid]];
                _sequencedTimers[uid] ++;
                if (_sequencedTimers[uid] >= a.length) {
                    _sequencedTimers[uid] = 0;
                }
                return value;
            };

            // TODO: replace with moment.js
            this.timeSince = function(date) {
                var seconds = Math.floor((new Date() - date) / 1000);

                var interval = Math.floor(seconds / 31536000);

                if (interval >= 1) {
                    return interval + ' years';
                }
                interval = Math.floor(seconds / 2592000);
                if (interval >= 1) {
                    return interval + ' months';
                }
                interval = Math.floor(seconds / 86400);
                if (interval >= 1) {
                    return interval + ' days';
                }
                interval = Math.floor(seconds / 3600);
                if (interval >= 1) {
                    return interval + ' hours';
                }
                interval = Math.floor(seconds / 60);
                if (interval >= 1) {
                    return interval + ' minutes';
                }
                return Math.floor(seconds) + ' seconds';
            };
        }
    ]);
