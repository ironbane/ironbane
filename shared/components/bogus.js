angular
    .module('components.bogus', ['ces'])
    .config([
        '$componentsProvider',
        function ($componentsProvider) {
            'use strict';

            $componentsProvider.register({
                'bogus': {

                }
            });
        }
    ]);
