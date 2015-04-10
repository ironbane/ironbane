angular
    .module('engine.scriptBank', [])
    .service('ScriptBank', [
        '$q',
        '$cacheFactory',
        function($q, $cacheFactory) {
            'use strict';

            var cache = $cacheFactory('scriptCache');

            this.get = function(path) {
                if (cache.get(path)) {
                    return $q.when(cache.get(path));
                } else {
                    return $q.reject('No such script found!');
                }
            };

            this.add = function(path, Script) {
                cache.put(path, Script);
            };
        }
    ]);
