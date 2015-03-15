angular.module('components.gameplay.health', ['ces'])
    .config(function ($componentsProvider) {
        'use strict';

        $componentsProvider.addComponentData({
            'health': {
                min: 0,
                max: 10,
                value: 10
            }
        });
    });