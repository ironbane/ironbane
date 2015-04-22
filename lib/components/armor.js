angular
    .module('components.armor', ['ces'])
    .config([
        '$componentsProvider',
        function ($componentsProvider) {
            'use strict';

            $componentsProvider.register({
                'armor': {
                    min: 0,
                    max: 20,
                    value: 20
                }
            });
        }
    ]);
