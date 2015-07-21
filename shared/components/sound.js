angular
    .module('components.sound', ['ces'])
    .config([
        '$componentsProvider',
        function($componentsProvider) {
            'use strict';

            $componentsProvider.register({
                'sound': {
                    asset: '',
                    volume: 1,
                    is3d: false,
                    autoPlay: true
                }
            });
        }
    ]);
