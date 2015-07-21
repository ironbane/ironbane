angular
    .module('components.shadow', ['ces'])
    .config([
        '$componentsProvider',
        function($componentsProvider) {
            'use strict';

            $componentsProvider.register({
                'shadow': {

                }
            });
        }
    ]);
