angular
    .module('components.trigger', ['ces'])
    .config([
        '$componentsProvider',
        function($componentsProvider) {
            'use strict';

            $componentsProvider.register({
                'trigger': {
                    type: 'area',
                    range: 5,
                    mask: 0,
                    enter: '',
                    exit: '',
                    stay: ''
                }
            });
        }
    ]);
