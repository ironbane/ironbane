angular.module('components.world.spawner', ['ces'])
    .config(function ($componentsProvider) {
        'use strict';

        $componentsProvider.addComponentData({
            'spawner': {
                type: 'npc', // npc or pc
                spawns: [], // array of types of npcs
                spawnRate: 100, // ticks per spawn
                spawnCount: 1 // total active spawns
            }
        });
    });
