angular
    .module('prefabs.spawnPoint', [])
    .factory('SpawnPointPrefab', [
        function() {
            'use strict';

            return function(entityData) {
                var customs = entityData.userData || {},
                    assembly = {
                        components: {
                            spawnPoint: {
                                tag: customs.tag,
                                type: customs.spawnType
                            }
                        }
                    };

                return assembly;
            };
        }
    ]);
