angular
    .module('components.netSend', ['ces'])
    .config([
        '$componentsProvider',
        function($componentsProvider) {
            'use strict';

            $componentsProvider.register({
                netSend: {
                    __serialize: false // let the server or client decide each time
                }
            });
        }
    ]);
