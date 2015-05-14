angular
    .module('models.items', [])
    .provider('ItemsCollection', function() {
        'use strict';

        var _collection = new Mongo.Collection('items');

        this.$get = [function() {
            return _collection;
        }];
    });
