angular
    .module('components.persisted', ['ces'])
    .config([
        '$componentsProvider',
        function($componentsProvider) {
            'use strict';

            $componentsProvider.register({
                persisted: {
                    __serialize: false // we don't want this one on the client
                }
            });
        }
    ]);
