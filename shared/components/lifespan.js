angular
    .module('components.lifespan', ['ces'])
    .config([
        '$componentsProvider',
        function ($componentsProvider) {
            'use strict';

            $componentsProvider.register({
                'lifespan': {
                    duration: 5
                }
            });
        }
    ]);
