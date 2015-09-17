angular
    .module('components.player', ['ces'])
    .config([
        '$componentsProvider',
        function($componentsProvider) {
            'use strict';

            // this one is pretty much just a tag for filtering
            $componentsProvider.registerShared({
                'player': {}
            });
        }
    ]);
