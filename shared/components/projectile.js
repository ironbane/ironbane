angular
    .module('components.projectile', ['ces'])
    .config([
        '$componentsProvider',
        function ($componentsProvider) {
            'use strict';

            $componentsProvider.register({
                'projectile': {
                    speed: 10
                }
            });
        }
    ]);
