angular
    .module('game.itemBehaviors.unique', [
        'game.itemBehaviors.baseItemBehavior',
        'global.constants.inv'
    ])
    .factory('UniqueItemBehavior', [
        'BaseItemBehavior',
        'INV_SLOTS',
        function(BaseItemBehavior, INV_SLOTS) {
            'use strict';

            class UniqueItemBehavior extends BaseItemBehavior {

                constructor() {
                    super();
                }

                onBeforeEquip(item, entity) {
                    var inv = entity.getComponent('inventory'),
                        canEquip = true;

                    if (!inv) {
                        return false;
                    }

                    INV_SLOTS.armorList.forEach(function(slot) {
                        if (inv[slot] && inv[slot].name === item.name) {
                            canEquip = false;
                            return;
                        }
                    });

                    return canEquip;
                }
            }

            return UniqueItemBehavior;
        }
    ]);
