angular
    .module('models.inventory', [])
    .provider('InventoryCollection', function() {
        'use strict';

        var _collection = new Mongo.Collection('inventory');

        this.$get = [function() {
            return _collection;
        }];
    });
