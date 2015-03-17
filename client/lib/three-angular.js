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

        $window.THREE.Vector3.prototype.deserialize = function (position) {
            this.x = position[0];
            this.y = position[1];
            this.z = position[2];
        };

        $window.THREE.Euler.prototype.deserialize = function (rotation) {
            this.x = rotation[0];
            this.y = rotation[1];
            this.z = rotation[2];
        };

		return $window.THREE;
	});
})();
