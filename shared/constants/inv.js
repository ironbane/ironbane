angular
    .module('global.constants.inv', [])
    .constant('INV_TYPES', {
        weapon: ['weapon'],
        armor: ['head', 'body', 'feet'],
        relic: ['relic'],
        cash: ['cash'],
        ingredient: ['ingredient'],
        misc: ['misc'],
        shield: ['shield'],
        consumable: ['food', 'potion', 'poison'],
        equipable: ['weapon', 'head', 'body', 'feet', 'relic', 'shield']
    })
    .constant('INV_SLOTS', {
        vanityList: [
            'vanity0'
        ],
        relicList: [
            'relic1',
            'relic2',
            'relic3'
        ],
        armorList: [
            'costume',
            'head',
            'body',
            'feet',
            'rhand',
            'lhand',
            'relic1',
            'relic2',
            'relic3'
        ],
        slotList: [
            'slot0',
            'slot1',
            'slot2',
            'slot3',
            'slot4',
            'slot5',
            'slot6',
            'slot7'
        ]
    });
