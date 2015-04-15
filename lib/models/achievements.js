angular
    .module('models.achievements', [])
    .provider('AchievementsCollection', function() {
        'use strict';

        var _collection = new Mongo.Collection('achievements');

        this.$get = [function() {
            return _collection;
        }];
    });
