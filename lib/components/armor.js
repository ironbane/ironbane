angular
    .module('components.armor', ['ces'])
    .config([
        '$componentsProvider',
        function ($componentsProvider) {
            'use strict';

            $componentsProvider.register({
                'armor': {
                    max: 0,
                    value: 0
                }
            });
        }
    ]);
