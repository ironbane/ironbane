angular
    .module('components.quad', ['ces'])
    .config([
        '$componentsProvider',
        function($componentsProvider) {
            'use strict';

            $componentsProvider.register({
                'quad': {
                    transparent: false,
                    color: 0xffffff,
                    texture: null,
                    charBuildData: null
                }
            });
        }
    ]);
