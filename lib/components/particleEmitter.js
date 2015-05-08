angular
    .module('components.particleEmitter', ['ces'])
    .config([
        '$componentsProvider',
        function($componentsProvider) {
            'use strict';

            $componentsProvider.register({
                particleEmitter: {
                    group: {

                    },
                    emitter: {

                    }
                }
            });
        }
    ]);
