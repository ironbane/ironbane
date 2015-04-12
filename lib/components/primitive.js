angular
    .module('components.primitive', ['ces'])
    .config([
        '$componentsProvider',
        function($componentsProvider) {
            'use strict';

            $componentsProvider.register({
                primitive: {
                    type: 'box'
                }
            });
        }
    ]);
