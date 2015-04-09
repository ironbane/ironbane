angular
    .module('components.world.spawnPoint', ['ces'])
    .config([
        '$componentsProvider',
        function($componentsProvider) {
            'use strict';

            $componentsProvider.addComponentData({
                'spawnPoint': {
                    type: 'respawn', // respawn, general, teleport ?
                    tag: 'start' // used to sort and find them
                }
            });
        }
    ]);
