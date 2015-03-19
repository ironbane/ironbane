angular.module('components.sound', ['ces'])
    .config(['$componentsProvider', function ($componentsProvider) {
        'use strict';

        $componentsProvider.addComponentData({
            'sound': {
                asset: '',
                volume: 1,
                is3d: false,
                autoPlay: true
            }
        });
    }]);
