angular
    .module('components.inventory', ['ces'])
    .config([
        '$componentsProvider',
        function($componentsProvider) {
            'use strict';

            $componentsProvider.register({
                'inventory': {
                    head: null,
                    body: null,
                    feet: null,
                    rhand: null,
                    lhand: null,
                    relic1: null,
                    relic2: null,
                    relic3: null,
                    slot1: null,
                    slot2: null,
                    slot3: null,
                    slot4: null,
                    slot5: null,
                    slot6: null,
                    slot7: null
                }
            });
        }
    ]);
