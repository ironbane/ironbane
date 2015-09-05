angular
    .module('components.fighter', ['ces'])
    .config([
        '$componentsProvider',
        function ($componentsProvider) {
            'use strict';

            $componentsProvider.register({
                'fighter': {
                    faction: 'ravenwood',
                	attackCooldown: 0.5
                }
            });
        }
    ]);
