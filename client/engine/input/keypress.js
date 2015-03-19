// this relies on and wraps keypress.js
angular.module('keypress', [])
.factory('KeypressListener', ['$window', function($window) {
    'use strict';

    return $window.keypress.Listener;
}]);
