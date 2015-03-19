angular.module('engine.util', [])
    .service('Util', ['THREE', '$textureCache', '$q', function (THREE, $textureCache, $q) {
            'use strict';

            this.getRandomInt = function (min, max) {
                return Math.floor(Math.random() * (max - min + 1)) + min;
            };

            // Random float between
            this.getRandomFloat = function (minValue, maxValue, precision) {
                precision = precision || 2;
                return parseFloat(Math.min(minValue + (Math.random() * (maxValue - minValue)), maxValue).toFixed(precision));
            };

            this.roundNumber = function (number, decimals) {
              var newnumber = new Number(number+'').toFixed(parseInt(decimals)); // jshint ignore:line
              return parseFloat(newnumber);
            };

            // The meteor-accounts-guest package is sometimes too slow in logging us in
            // that's why we need to check here if we have an assigned guest user
            this.waitForMeteorGuestUserLogin = function (fn) {
				var doCheck = function () {
					var user = Meteor.user();
					if (user) {
						fn();
					}
					else {
						Meteor.setTimeout(doCheck, 10);
					}
				};

				Meteor.setTimeout(doCheck, 10);
            };
        }]
    );
