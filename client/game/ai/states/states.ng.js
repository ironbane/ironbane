angular
    .module('game.ai.states', [
        'game.ai.states.local',
        'ces'
    ])
    .service('States', function(GoToPosition, FindPathToPosition, SeekEntity, SeekEntitySimple, SearchAndDestroyEntity, $log) {
            'use strict';

            // TODO is there a way to automatically load these?

            var states = {
                'goToPosition': GoToPosition,
                'findPathToPosition': FindPathToPosition,
                'seekEntity': SeekEntity,
                'seekEntitySimple': SeekEntitySimple,
                'searchAndDestroyEntity': SearchAndDestroyEntity
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
