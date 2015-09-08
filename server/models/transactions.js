angular
    .module('models.transactions', [])
    .provider('TransactionsCollection', function() {
        'use strict';

        var _collection = new Mongo.Collection('transactions');

        this.$get = [function() {
            return _collection;
        }];
    });
