angular
    .module('engine.util', [
        'three',
        'util.hash'
    ])
    .service('IbUtils', ['$q', 'THREE', 'Hash', function($q, THREE, Hash) {
        'use strict';

        this.getRandomInt = function(min, max) {
            return Math.floor(Math.random() * (max - min + 1)) + min;
        };

        // Random float between
        this.getRandomFloat = function(minValue, maxValue, precision) {
            precision = precision || 2;
            return parseFloat(Math.min(minValue + (Math.random() * (maxValue - minValue)), maxValue).toFixed(precision));
        };

        this.shortMD5 = function (str) {
            return Hash.md5(str).substr(0, 4);
        };

        this.getRandomVector3 = function(base, spread) {
            var v = new THREE.Vector3();

            v.copy(base);

            v.x += Math.random() * spread.x - (spread.x / 2);
            v.y += Math.random() * spread.y - (spread.y / 2);
            v.z += Math.random() * spread.z - (spread.z / 2);

            return v;
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
        this.chooseFromSequence = function(a, uid) {
            if (!uid) {
                uid = '';
                for (var b in a) {
                    uid += b;
                }
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

        this.generateUuid = THREE.Math.generateUUID;

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

        this.spriteSheetIdToXY = function (id, size) {
            if (!size) {
                console.error('no size given!');
                size = 16;
            }
            return {
                h: (id%size),
                v: (Math.floor(id/size))
            }
        };
    }]);
