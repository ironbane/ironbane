angular.module('components.sound', ['ces'])
    .config(function ($componentsProvider) {
        'use strict';

        $componentsProvider.addComponentData({
            'sound': {
                asset: '',
                volume: 1,
                is3d: false,
                autoPlay: true
            }
        });
    });
