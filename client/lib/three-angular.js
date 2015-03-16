'use strict';

(function () {
	var module = angular.module('three', []);
	module.factory('THREE', function ($window) {

        var roundNumber = function (number, decimals) {
			var newnumber = new Number(number+'').toFixed(parseInt(decimals)); // jshint ignore:line
			return parseFloat(newnumber);
        };

        $window.THREE.Vector3.prototype.serialize = function () {
            return [roundNumber(this.x, 2), roundNumber(this.y, 2), roundNumber(this.z, 2)];
        };

        $window.THREE.Euler.prototype.serialize = function () {
            return [roundNumber(this.x, 2), roundNumber(this.y, 2), roundNumber(this.z, 2)];
        };

		return $window.THREE;
	});
})();
