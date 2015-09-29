angular
    .module('prefabs.teleportExit', [])
    .factory('TeleportExitPrefab', [
        function() {
            'use strict';

            return function(entityData) {
                var customs = entityData.userData || {},
                    assembly = {
                        components: {
                            teleporter: {
                                type: 'exit'
                            }
                        }
                    };

                return assembly;
            };
        }
    ]);
