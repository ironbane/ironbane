angular
    .module('components.cheats', ['ces'])
    .config([
        '$componentsProvider',
        function ($componentsProvider) {
            'use strict';

            $componentsProvider.register({
                'cheats': {
                    jump: false
                }
            });
        }
    ]);
