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
                    width: 1.0,
                    height: 1.0,
                    style: 'billboard',
                    indexH: 0,
                    indexV: 0,
                    numberOfSpritesH: 1,
                    numberOfSpritesV: 1,
                    mirror: false,
                    setVisibleOnLoad: true,
                    offsetPosition: {
                        x: 0,
                        y: 0,
                        z: 0
                    }
                }
            });
        }
    ]);
