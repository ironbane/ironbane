angular
    .module('prefabs.damageZone', [])
    .factory('DamageZonePrefab', [
        function() {
            'use strict';

            return function(entityData) {
                var customs = entityData.userData || {},
                    assembly = {
                        components: {
                            damageZone: {
                                damagePerSecond: customs.damagePerSecond
                            }
                        }
                    };

                return assembly;
            };
        }
    ]);
