angular
    .module('components.networked', ['ces'])
    .config([
        '$componentsProvider',
        function($componentsProvider) {
            'use strict';

            $componentsProvider.register({
                networked: {
                    send: true,
                    recieve: true
                }
            });
        }
    ]);
