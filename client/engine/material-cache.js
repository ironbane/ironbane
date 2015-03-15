angular.module('engine.material-cache', [])
    .service('$materialCache', [
        '$cacheFactory',
        function ($cacheFactory) {
            'use strict';

            var _cache = $cacheFactory('$materialCache');
            return _cache;
        }
    ]);