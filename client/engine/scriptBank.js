angular
    .module('engine.scriptBank', [])
    .service('ScriptBank', [
        '$q',
        '$cacheFactory',
        '$http',
        function($q, $cacheFactory, $http) {
            'use strict';

            var cache = $cacheFactory('scriptCache');

            this.get = function(path) {
                if (cache.get(path)) {
                    return $q.when(cache.get(path));
                } else {
                    return $http.get(path)
                        .then(function(response) {
                            var Script = eval(response.data); // jshint ignore:line
                            cache.put(path, Script);

                            return Script;
                        }, function(response) {
                            return $q.reject('Ajax Error: ' + path + ' >> ' + response.data);
                        });
                }
            };

            this.add = function(path, Script) {
                cache.put(path, Script);
            };
        }
    ]);
