'use strict';

(function() {
    var module = angular.module('three', []);
    module.factory('THREE', function($window) { return $window.THREE; });
})();
