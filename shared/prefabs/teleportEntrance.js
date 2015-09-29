angular
    .module('prefabs.teleportEntrance', [])
    .factory('TeleportEntrancePrefab', [
        function() {
            'use strict';

            return function(entityData) {
                var customs = entityData.userData || {},
                    assembly = {
                        components: {
                            teleporter: {
                                type: 'entrance',
                                nameOfTeleportExit: customs.nameOfTeleportExit
                            }
                        }
                    };

                return assembly;
            };
        }
    ]);
