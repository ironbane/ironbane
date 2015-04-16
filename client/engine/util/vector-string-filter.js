angular
    .module('engine.util.vectorToStringFilter', [
        'engine.util.roundFilter'
    ])
    .filter('vectorToString', [
        'roundFilter',
        function(roundFilter) {
            'use strict';

            return function(vector) {
                if (angular.isNumber(vector.x) && angular.isNumber(vector.y) && angular.isNumber(vector.z)) {
                    return ['{x: ', roundFilter(vector.x, 2), ', y: ', roundFilter(vector.y, 2), ', z: ', roundFilter(vector.z, 2), '}'].join('');
                } else {
                    return 'not a vector!';
                }
            };
        }
    ]);
