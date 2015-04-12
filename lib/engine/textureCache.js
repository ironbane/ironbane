angular
    .module('engine.textureCache', [])
    .service('$textureCache', [
        '$cacheFactory',
        function($cacheFactory) {
            'use strict';

            return $cacheFactory('$textureCache');
        }
    ]);
