angular
    .module('models.servers', [])
    .provider('ServersCollection', function() {
        'use strict';

        var _collection = new Mongo.Collection('servers');

        this.$get = [function() {
            return _collection;
        }];
    });
