angular
    .module('components.damageable', ['ces'])
    .config([
        '$componentsProvider',
        function($componentsProvider) {
            'use strict';

            $componentsProvider.register({
                'damageable': {
                    sources: []
                }
            });
        }
    ]);
