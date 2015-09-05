angular
    .module('components.wieldItem', ['ces'])
    .config([
        '$componentsProvider',
        function($componentsProvider) {
            'use strict';

            $componentsProvider.register({
                'wieldItem': {
                    rhand: null,
                    lhand: null,
                    offsetPosition: {
                        x: 0,
                        y: 0,
                        z: 0
                    }
                }
            });
        }
    ]);
