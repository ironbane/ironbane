angular
    .module('components.localState', ['ces'])
    .config([
        '$componentsProvider',
        function ($componentsProvider) {
            'use strict';

            $componentsProvider.register({
                'localState': {
                    stateName: 'wander'
                }
            });
        }
    ]);
