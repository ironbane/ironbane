'use strict';

(function() {
    var module = angular.module('ammo', ['three']);
    module.factory('Ammo', ['$window', 'THREE', function($window, THREE) {

        $window.Ammo.btVector3.prototype.toTHREEVector3 = function () {
            return new THREE.Vector3(this.x(), this.y(), this.z());
        };

        return $window.Ammo;
    }]);
})();
