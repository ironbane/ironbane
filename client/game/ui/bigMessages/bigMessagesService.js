angular
    .module('game.ui.bigMessages.bigMessagesService', [])
    .service('BigMessagesService', [
        '$timeout',
        function($timeout) {
            'use strict';

            var me = this;

            this.messages = [];

            this.add = function(text) {
                var msg = {
                    text: text
                };

                me.messages.push(msg);

                $timeout(function() {
                    me.messages.shift();
                }, 5000);
            };
        }
    ]);
