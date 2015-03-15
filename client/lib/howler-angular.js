(function() {
    'use strict';

    var module = angular.module('howler', []);
    module.factory('Howler', function($window) { return $window.Howler; });
    module.factory('Howl', function($window) { return $window.Howl; });
})();
