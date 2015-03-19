'use strict';

(function() {
    var module = angular.module('meteor', []);
    module.factory('Meteor', ['$window', function($window) {
        return $window.Meteor;
    }]);
    module.factory('Tracker', ['$window', function($window) {
        return $window.Tracker;
    }]);
})();
