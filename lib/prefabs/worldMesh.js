angular
    .module('prefabs.worldMesh', [])
    .factory('WorldMeshPrefab', [
        function() {
            'use strict';

            return function() {
                var assembly = {
                        components: {
                            octree: { /* defaults... */ },
                            rigidBody: {
                                shape: {
                                    type: 'concave'
                                },
                                mass: 0
                            }
                        }
                    };

                return assembly;
            };
        }
    ]);
