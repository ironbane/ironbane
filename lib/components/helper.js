angular
    .module('components.helper', ['ces'])
    .config([
        '$componentsProvider',
        function($componentsProvider) {
            'use strict';

            $componentsProvider.register({
                'helper': {
                    line: false
                }
            });
        }
    ]);
