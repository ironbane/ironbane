angular
    .module('components.spawnZone', ['ces'])
    .config([
        '$componentsProvider',
        function($componentsProvider) {
            'use strict';

            $componentsProvider.register({
                'spawnZone': {
                    entitiesToSpawnSeparatedByCommas: 'Rat',
                    amountOfEntitiesToHaveAtAllTimes: 5,
                    spawnDelay: 5.0,
                    teleportToGroundBelow: true
                }
            });
        }
    ]);
