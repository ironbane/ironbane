angular
    .module('models.chatRooms', [])
    .provider('ChatRoomsCollection', function() {
        'use strict';

        var _collection = new Mongo.Collection('chatRooms');

        this.$get = [function() {
            return _collection;
        }];
    });
