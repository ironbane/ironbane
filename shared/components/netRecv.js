angular
    .module('components.netRecv', ['ces'])
    .config([
        '$componentsProvider',
        function($componentsProvider) {
            'use strict';

            $componentsProvider.register({
                netRecv: {
                    __serialize: false // we'll handle this case by case
                }
            });
        }
    ]);
