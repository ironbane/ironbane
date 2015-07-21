angular
    .module('prefabs.proctree', [])
    .constant('ProctreePrefab', {
        components: {
            'proctree': {
                seed: 'random',
                lengthFalloffFactor: 1.22,
                trunkLength: 4,
                levels: 1
            }
        }
    });
