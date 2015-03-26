angular.module('engine.ib-constants', [])
	.service('IbConstants', ['$window', function ($window) {
		'use strict';

		return $window.ironbaneConstants;
	}]);
