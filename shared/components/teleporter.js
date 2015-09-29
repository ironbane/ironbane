angular
    .module('components.teleporter', ['ces'])
    .config([
        '$componentsProvider',
        function($componentsProvider) {
            'use strict';

            $componentsProvider.register({
                'teleporter': {
                    type: 'entrance',
                    nameOfTeleportExit: ''
                }
            });
        }
    ]);
