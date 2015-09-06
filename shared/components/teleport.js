angular
    .module('components.teleport', ['ces'])
    .config([
        '$componentsProvider',
        function($componentsProvider) {
            'use strict';

            $componentsProvider.register({
                'teleport': {
                    targetEntityUuid: null,
                    offsetPosition: {
                        x: 0,
                        y: 0,
                        z: 0
                    }
                }
            });
        }
    ]);
