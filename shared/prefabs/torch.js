angular
    .module('prefabs.torch', [])
    .constant('TorchPrefab', {
        components: {
            'model': {
                type: 'Box'
            },
            'light': {
                type: 'PointLight',
                distance: 5,
                color: 0x60511b
            }
        }
    });
