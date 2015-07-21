angular
    .module('engine.geometryCache', [])
    .service('$geometryCache', [
        '$cacheFactory',
        function($cacheFactory) {
            'use strict';

            var _cache = $cacheFactory('$geometryCache');
            return _cache;
        }
    ]);
