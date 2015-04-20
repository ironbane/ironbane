angular
    .module('components.netSend', ['ces'])
    .config([
        '$componentsProvider',
        function($componentsProvider) {
            'use strict';

            $componentsProvider.register({
                netSend: {

                }
            });
        }
    ]);
