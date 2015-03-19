angular.module('components.gameplay.health', ['ces'])
    .config(['$componentsProvider', function ($componentsProvider) {
        'use strict';

        $componentsProvider.addComponentData({
            'health': {
                min: 0,
                max: 10,
                value: 10
            }
        });
    }]);