angular
    .module('components.steeringBehaviour', ['ces'])
    .config([
        '$componentsProvider',
        function ($componentsProvider) {
            'use strict';

            $componentsProvider.register({
                'steeringBehaviour': {

                }
            });
        }
    ]);
