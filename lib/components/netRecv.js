angular
    .module('components.netRecv', ['ces'])
    .config([
        '$componentsProvider',
        function($componentsProvider) {
            'use strict';

            $componentsProvider.register({
                netRecv: {

                }
            });
        }
    ]);
