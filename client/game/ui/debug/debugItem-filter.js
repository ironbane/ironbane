angular.module('game.ui.debug.debugItemFilter', [
    'three',
    'engine.util.vectorToStringFilter'
])
.filter('debugItem', [
    'THREE',
    '$filter',
    function(THREE, $filter) {
        'use strict';

        return function(input) {
            if(input instanceof THREE.Vector3) {
                return $filter('vectorToString')(input);
            }

            return input;
        };
    }
]);
