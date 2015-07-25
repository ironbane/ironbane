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
                    charBuildData: null,
                    style: 'billboard',
                    indexH: 0,
                    indexV: 0,
                    numberOfSpritesH: 1,
                    numberOfSpritesV: 1,
                    mirror: false
                }
            });
        }
    ]);
