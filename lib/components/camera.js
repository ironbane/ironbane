angular
    .module('components.camera', ['ces'])
    .config([
        '$componentsProvider',
        function($componentsProvider) {
            'use strict';

            $componentsProvider.register({
                'camera': {
                    aspectRatio: 16 / 9,
                    nearClip: 0.1,
                    farClip: 1000,
                    fov: 45,
                    projection: 'perspective',
                    priority: 0,
                    top: 0,
                    left: 0,
                    right: 1,
                    bottom: 1
                }
            });
        }
    ]);
