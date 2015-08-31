angular
    .module('engine.textureLoader', [])
    .service('TextureLoader', [
        '$q',
        '$log',
        function($q, $log) {
            'use strict';

            this.load = function(src) {
                return $q.when();
            };

        }
    ]);
