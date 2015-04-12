angular
    .module('components.persisted', ['ces'])
    .config([
        '$componentsProvider',
        function($componentsProvider) {
            'use strict';

            $componentsProvider.register({
                persisted: {}
            });
        }
    ]);
