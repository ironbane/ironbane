angular
    .module('game.ai.states', [
        'game.ai.states.local',
        'game.ai.states.global',
        'ces'
    ])
    .service('States', function(MonsterState, GoToPosition, $log) {
            'use strict';

            var states = {
                'monster': MonsterState,
                'goToPosition': GoToPosition
            };

            this.get = function(name, entity, config, world) {
                if (states[name]) {
                    var state = new states[name](entity, config, world);
                    return state;
                }
                else {
                    $log.error('State ' + name + ' not found!');
                }
            };
        }
    );
