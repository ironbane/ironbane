angular
    .module('components.fighter', ['ces'])
    .config([
        '$componentsProvider',
        function ($componentsProvider) {
            'use strict';

            $componentsProvider.register({
                'fighter': {

                }
            });
        }
    ]);
