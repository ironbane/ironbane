angular
    .module('components.health', ['ces'])
    .config([
        '$componentsProvider',
        function($componentsProvider) {
            'use strict';

            $componentsProvider.register({
                'health': {
                    min: 0,
                    max: 10,
                    value: 10
                }
            });
        }
    ]);
