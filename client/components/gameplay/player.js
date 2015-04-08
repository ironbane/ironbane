angular
    .module('components.gameplay.player', ['ces'])
    .config(['$componentsProvider', function($componentsProvider) {
        'use strict';

        // this one is pretty much just a tag for filtering
        $componentsProvider.addComponentData({
            'player': {
                handle: ''
            }
        });
    }]);
