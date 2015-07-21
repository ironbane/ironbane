angular
    .module('models.chatMessages', [])
    .provider('ChatMessagesCollection', function() {
        'use strict';

        var _collection = new Mongo.Collection('chatMessages');

        this.$get = [function() {
            return _collection;
        }];
    });
