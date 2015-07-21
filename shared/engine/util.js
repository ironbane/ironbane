angular
    .module('engine.util', [])
    .service('IbUtils', ['$q', function($q) {
        'use strict';

        this.getRandomInt = function(min, max) {
            return Math.floor(Math.random() * (max - min + 1)) + min;
        };

        // Random float between
        this.getRandomFloat = function(minValue, maxValue, precision) {
            precision = precision || 2;
            return parseFloat(Math.min(minValue + (Math.random() * (maxValue - minValue)), maxValue).toFixed(precision));
        };

        this.roundNumber = function(number, decimals) {
            var newnumber = new Number(number + '').toFixed(parseInt(decimals)); // jshint ignore:line
            return parseFloat(newnumber);
        };

		this.lerpNumber = function(number, t, alpha) {
		  return number + ( t - number ) * alpha;
		};

        // The meteor-accounts-guest package is sometimes too slow in logging us in
        // that's why we need to check here if we have an assigned guest user
        this.waitForMeteorGuestUserLogin = function() {
        	var deferred = $q.defer();
            var doCheck = function() {
                var user = Meteor.user();
                if (user) {
                    deferred.resolve(user);
                } else {
                    Meteor.setTimeout(doCheck, 10);
                }
            };

            Meteor.setTimeout(doCheck, 10);
            return deferred.promise;
        };

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

        // Used to convert a vector (such as input/velocity) to Euler angles
        this.vecToEuler = function(rotVec) {
            var simpleRotationY = (Math.atan2(rotVec.z, rotVec.x));
            if (simpleRotationY < 0) {
                simpleRotationY += (Math.PI * 2);
            }
            simpleRotationY = (Math.PI * 2) - simpleRotationY;

            return simpleRotationY;
        };

    }]);
