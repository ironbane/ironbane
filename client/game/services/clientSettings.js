angular
    .module('game.clientSettings', [])
    .service('$clientSettings', [
        '$cacheFactory',
        function($cacheFactory) {
            'use strict';

            return $cacheFactory('$clientSettings');
        }
    ]);
