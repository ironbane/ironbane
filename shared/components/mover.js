angular
    .module('components.mover', ['ces'])
    .config([
        '$componentsProvider',
        function($componentsProvider) {
            'use strict';

            $componentsProvider.register({
                'mover': {
                    path: [],
                    pos: [],
                    rot: [],
                    loop: true,
                    cyclic: true,
                    speed: 0.2
                }
            });
        }
    ]);
