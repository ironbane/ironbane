angular
    .module('components.model', ['ces'])
    .config([
        '$componentsProvider',
        function($componentsProvider) {
            'use strict';

            $componentsProvider.register({
                'model': {
                    'type': 'Box',
                    'material': null,
                    'mesh': null,
                    'receiveShadows': true,
                    'castShadows': false
                }
            });
        }
    ]);
