angular
    .module('components.wieldItem', ['ces'])
    .config([
        '$componentsProvider',
        function($componentsProvider) {
            'use strict';

            $componentsProvider.register({
                'wieldItem': {
                    rhand: null,
                    lhand: null
                }
            });
        }
    ]);
