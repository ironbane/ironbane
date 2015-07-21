(function(_) {
    'use strict';

    angular
        .module('underscore', [])
        .provider('_', function() {
            this.$get = function() {
                return _;
            };
        });
})(this._);
