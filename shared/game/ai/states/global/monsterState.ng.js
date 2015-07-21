angular
    .module('game.ai.states.global')
    .factory('MonsterState', function(Class) {
            'use strict';

            return Class.extend({
                init: function(entity) {

                },
                update: function(dTime) {

                },
                destroy: function() {

                },
                handleMessage: function(message, data) {

                    switch (message) {
                        case "attacked":


                            break;
                        case "stopChase":
                        case "respawned":


                            break;
                    }
                }
            });
        }
    )
