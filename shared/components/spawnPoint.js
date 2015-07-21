angular
    .module('components.spawnPoint', ['ces'])
    .config([
        '$componentsProvider',
        function($componentsProvider) {
            'use strict';

            $componentsProvider.register({
                'spawnPoint': {
                    type: 'respawn', // respawn, general, teleport ?
                    tag: 'start' // used to sort and find them
                }
            });
        }
    ]);
