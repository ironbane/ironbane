angular
    .module('models.stats', [])
    .provider('StatsCollection', function() {
        'use strict';

        var _collection = new Mongo.Collection('stats');

        this.$get = [function() {
            return _collection;
        }];
    });
