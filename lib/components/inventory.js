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
                    rweapon: null,
                    lweapon: null,
                    trinket: null,
                    slot1: null,
                    slot2: null,
                    slot3: null,
                    slot4: null,
                    slot5: null,
                    slot6: null,
                    slot7: null,
                    slot8: null,
                    slot9: null,
                    slot10: null
                }
            });
        }
    ]);
