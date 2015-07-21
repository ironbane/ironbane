/*global Roles: true*/
angular
    .module('models.roles', [])
    .provider('RolesCollection', function() {
        'use strict';

        // this should be defined globally by Meteor by now
        this.$get = [function() {
            return Roles;
        }];
    });
