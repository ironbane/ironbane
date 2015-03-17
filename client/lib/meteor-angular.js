'use strict';

(function() {
    var module = angular.module('meteor', []);
    module.factory('Meteor', function($window) {
        return $window.Meteor;
    });
    module.factory('Tracker', function($window) {
        return $window.Tracker;
    });
})();
