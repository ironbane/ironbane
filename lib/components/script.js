angular
    .module('components.script', ['ces'])
    .config([
        '$componentsProvider',
        function($componentsProvider) {
            'use strict';

            $componentsProvider.register({
                'script': {
                    scripts: []
                }
            });
        }
    ]);
