angular
    .module('components.armorRegen', ['ces'])
    .config([
        '$componentsProvider',
        function ($componentsProvider) {
            'use strict';

            $componentsProvider.register({
                'armorRegen': {
                    rate: 2.0,
                    amount: 0.25
                }
            });
        }
    ]);
