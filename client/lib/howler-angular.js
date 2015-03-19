(function() {
    'use strict';

    var module = angular.module('howler', []);
    module.factory('Howler', ['$window', function($window) { return $window.Howler; }]);
    module.factory('Howl', ['$window', function($window) { return $window.Howl; }]);
})();
