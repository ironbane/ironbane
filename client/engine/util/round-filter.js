angular
    .module('engine.util.roundFilter', [])
    .filter('round', function() {
        'use strict';

        return function(number, decimals) {
            return +(Math.round(number + 'e+' + decimals) + 'e-' + decimals);
        };
    });
