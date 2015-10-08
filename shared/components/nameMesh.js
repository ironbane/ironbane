angular
    .module('components.nameMesh', ['ces'])
    .config([
        '$componentsProvider',
        function($componentsProvider) {
            'use strict';

            $componentsProvider.register({
                'name-mesh': {
                    text: 'name',
                    color: '#FFFFFF',
                    stroke: '#000000',
                    fontsize: 52,
                    fontface: 'volter_goldfishregular'
                }
            });
        }
    ]);
