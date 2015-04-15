/*global Accounts: true*/
angular
    .module('models.accounts', [])
    .provider('AccountsCollection', function() {
        'use strict';

        // this should be defined globally by Meteor by now
        this.$get = [function() {
            return Accounts;
        }];
    });
