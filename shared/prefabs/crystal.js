angular
    .module('prefabs.crystal', [])
    .constant('CrystalPrefab', {
        components: {
            script: {
                scripts: [{
                    src: 'scripts/test.js',
                    params: {
                        speed: 0.5
                    }
                }]
            }
        }
    });
