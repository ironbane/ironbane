angular
    .module('components.teleportSelf', ['ces'])
    .config([
        '$componentsProvider',
        function($componentsProvider) {
            'use strict';

            $componentsProvider.register({
                'teleportSelf': {
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
