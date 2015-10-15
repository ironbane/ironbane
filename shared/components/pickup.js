angular
    .module('components.pickup', ['ces'])
    .config([
        '$componentsProvider',
        function($componentsProvider) {
            'use strict';

            $componentsProvider.register({
                'pickup': {
                    hover: {
                        amplitude: 0.15,
                        speed: 3.25
                    },
                    item: null
                }
            });
        }
    ]);
