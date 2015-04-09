angular
    .module('components.spawner', ['ces'])
    .config([
        '$componentsProvider',
        function($componentsProvider) {
            'use strict';

            $componentsProvider.register({
                'spawner': {
                    type: 'npc', // npc or pc
                    spawns: [], // array of types of npcs
                    spawnRate: 100, // ticks per spawn
                    spawnCount: 1 // total active spawns
                }
            });
        }
    ]);
