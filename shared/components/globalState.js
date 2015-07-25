angular
    .module('components.globalState', ['ces'])
    .config([
        '$componentsProvider',
        function ($componentsProvider) {
            'use strict';

            $componentsProvider.register({
                'globalState': {
                    state: 'empty',
                    config: {}
                }
            });
        }
    ]);
