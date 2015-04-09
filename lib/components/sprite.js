angular
    .module('components.sprite', ['ces'])
    .config([
        '$componentsProvider',
        function($componentsProvider) {
            'use strict';

            $componentsProvider.register({
                'sprite': {
                    color: 0xffffff,
                    texture: null
                }
            });
        }
    ]);
