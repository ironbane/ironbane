angular.module('engine.util', [])
    .service('Util', function (THREE, $textureCache, $q) {
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
        }
    );
