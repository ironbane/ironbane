angular
    .module('components.projectile', ['ces'])
    .config([
        '$componentsProvider',
        function ($componentsProvider) {
            'use strict';

            $componentsProvider.register({
                'projectile': {
                    ownerUuid: null,
                    speed: 10,
                    item: null
                }
            });
        }
    ]);
