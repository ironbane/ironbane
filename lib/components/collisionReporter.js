angular
    .module('components.collisionReporter', ['ces'])
    .config([
        '$componentsProvider',
        function($componentsProvider) {
            'use strict';

            $componentsProvider.register({
                'collisionReporter': {

                }
            });
        }
    ]);
