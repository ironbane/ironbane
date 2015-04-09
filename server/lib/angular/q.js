var Q = Meteor.npmRequire('q');

angular
    .module('ng')
    .provider('$q', function() {
        'use strict';

        this.$get = function() {
            return Q;
        };
    });
