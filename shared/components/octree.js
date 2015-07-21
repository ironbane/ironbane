angular
    .module('components.octree', ['ces'])
    .config([
        '$componentsProvider',
        function($componentsProvider) {
            'use strict';

            $componentsProvider.register({
                octree: {
                    undeferred: true,
                    useFaces: true
                }
            });
        }
    ]);
