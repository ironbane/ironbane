angular
    .module('game.ai.states', [
        'game.ai.states.local',
        'game.ai.states.global',
        'ces'
    ])
    .service('States', function(MonsterState, $log) {
            'use strict';

            var states = {
                'monster': MonsterState,
            };

            this.get = function(name, entity) {
                if (states[name]) {
                    var state = new states[name](entity);
                    state.entity = entity;
                    return state;
                }
                else {
                    $log.error('State ' + name + ' not found!');
                }
            };
        }
    );
