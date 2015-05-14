angular
    .module('components.armorRegen', ['ces'])
    .config([
        '$componentsProvider',
        function ($componentsProvider) {
            'use strict';

            $componentsProvider.register({
                'armorRegen': {
                    rate: 0.5,
                    amount: 1
                }
            });
        }
    ]);
