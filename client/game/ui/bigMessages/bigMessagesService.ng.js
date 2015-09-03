angular
    .module('game.ui.bigMessages.bigMessagesService', [])
    .service('BigMessagesService', function() {
            'use strict';

            var me = this;

            this.messages = [];

            this.add = function(text) {

                var msg = {
                    text: text
                };

                me.messages.push(msg);

                setTimeout(function () {
                    me.messages.shift();
                }, 5000);
            };

        }
    );
