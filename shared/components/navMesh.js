angular
    .module('components.navMesh', ['ces'])
    .config([
        '$componentsProvider',
        function($componentsProvider) {
            'use strict';

            $componentsProvider.register({
                'navMesh': {

                }
            });
        }
    ]);
