angular
    .module('engine.entity-cache', [])
    .service('$entityCache', [
        '$cacheFactory',
        function($cacheFactory) {
            'use strict';

            var _cache = $cacheFactory('$cacheFactory');
            return _cache;
        }
    ]);
