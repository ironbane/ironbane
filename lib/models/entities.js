angular
    .module('models.entities', [])
    .provider('EntitiesCollection', function() {
        'use strict';

        var _collection = new Mongo.Collection('entities');

        this.$get = [function() {
            return _collection;
        }];
    });
