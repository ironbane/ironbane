angular
    .module('systems.inventory', [
        'ces'
    ])
    .factory('InventorySystem', [
        '$log',
        'System',
        'Signal',
        function($log, System, Signal) {
            'use strict';

            var isEquipable = function(item) {
                return item.type === 'head' || item.type === 'body' || item.type === 'feet' || item.type === 'trinket' || item.type.search(/weapon/ig) >= 0;
            };

            var InventorySystem = System.extend({
                init: function() {
                    this._super();

                    this.onEquipmentChanged = new Signal();
                },
                addedToWorld: function(world) {
                    this._super(world);
                },
                equipItem: function(entity, slot) {
                    var inventory = entity.getComponent('inventory');
                    if (inventory && inventory[slot]) {
                        var itemToEquip = inventory[slot];
                        if (isEquipable(itemToEquip)) {
                            // TODO: handle weapons
                            if (inventory[itemToEquip.type]) {
                                var currentItem = inventory[itemToEquip.type];
                                inventory[itemToEquip.type] = inventory[slot];
                                inventory[slot] = currentItem;
                            } else {
                                inventory[itemToEquip.type] = inventory[slot];
                                inventory[slot] = null;
                            }
                        }

                        this.onEquipmentChanged.emit(entity);
                    }

                    return;
                },
                update: function() {

                }
            });

            return InventorySystem;
        }
    ]);
