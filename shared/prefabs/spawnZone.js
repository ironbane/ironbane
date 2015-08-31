angular
    .module('prefabs.spawnZone', [])
    .factory('SpawnZonePrefab', [
        function() {
            'use strict';

            return function(entityData) {
                var customs = entityData.userData || {},
                    assembly = {
                        components: {
                            spawnZone: {
                                entitiesToSpawnSeparatedByCommas: customs.entitiesToSpawnSeparatedByCommas,
                                amountOfEntitiesToHaveAtAllTimes: customs.amountOfEntitiesToHaveAtAllTimes,
                                spawnDelay: customs.spawnDelay,
                                teleportToGroundBelow: customs.teleportToGroundBelow
                            }
                        }
                    };

                return assembly;
            };
        }
    ]);
