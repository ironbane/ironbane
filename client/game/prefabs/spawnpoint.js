angular.module('game.prefabs.spawnpoint', [])
    .constant('SpawnPointPrefab', {
        components: {
            'spawner': {
                type: 'NPC',
                spawns: ['Bunny'],
                spawnRate: 100,
                spawnCount: 10
            }
        }
    });
