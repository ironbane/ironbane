// this relies on and wraps keypress.js
angular.module('keypress', [])
.factory('KeypressListener', function($window) {
    'use strict';

    return $window.keypress.Listener;
});
