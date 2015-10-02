angular
    .module('components.healthRegen', ['ces'])
    .config([
        '$componentsProvider',
        function ($componentsProvider) {
            'use strict';

            $componentsProvider.register({
                'healthRegen': {
                    rate: 5.0,
                    amount: 0.5
                }
            });
        }
    ]);
