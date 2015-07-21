angular
    .module('components.mesh', ['ces'])
    .config([
        '$componentsProvider',
        function($componentsProvider) {
            'use strict';

            $componentsProvider.register({
                mesh: {

                }
            });
        }
    ]);
