angular
    .module('models.zones', [])
    .provider('ZonesCollection', function() {
        'use strict';

        var _collection = new Mongo.Collection('zones');

        this.$get = [function() {
            return _collection;
        }];
    });
