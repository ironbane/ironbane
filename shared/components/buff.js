angular
    .module('components.buff', ['ces'])
    .config([
        '$componentsProvider',
        function ($componentsProvider) {
            'use strict';

            $componentsProvider.register({
                'buff': {
                    type: 'heal',
                    amountPerInterval: 1,
                    duration: 5,
                    interval: 1.0
                }
            });
        }
    ]);
