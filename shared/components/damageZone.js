angular
    .module('components.damageZone', ['ces'])
    .config([
        '$componentsProvider',
        function($componentsProvider) {
            'use strict';

            $componentsProvider.register({
                'damageZone': {
                    damagePerSecond: 1.0
                }
            });
        }
    ]);
