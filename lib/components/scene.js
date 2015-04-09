angular
    .module('components.scene', ['ces'])
    .config([
        '$componentsProvider',
        function($componentsProvider) {
            'use strict';

            $componentsProvider.register({
                'scene': {
                    'path': ''
                }
            });
        }
    ]);
