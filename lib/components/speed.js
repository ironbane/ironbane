angular
    .module('components.speed', ['ces'])
    .config([
        '$componentsProvider',
        function ($componentsProvider) {
            'use strict';

            $componentsProvider.register({
                'speed': {
                    maxSpeed: 4,
                    acceleration: 0.7,
                    rotateSpeed: 2.5
                }
            });
        }
    ]);
