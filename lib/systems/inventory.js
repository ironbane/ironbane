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
                return item.type === 'head' || item.type === 'body' || item.type === 'feet' || item.type === 'relic' || item.type.search(/weapon/ig) >= 0;
            };

            var InventorySystem = System.extend({
                init: function() {
                    this._super();

                    this.onEquipItem = new Signal();
                    this.onUnEquipItem = new Signal();
                    this.onItemAdded = new Signal();
                    this.onItemRemoved = new Signal();
                },
                addedToWorld: function(world) {
                    this._super(world);
                },
                findEmptySlot: function(entity) {
                    var inventory = entity.getComponent('inventory'),
                        slot = null;

                    if (!inventory) {
                        return slot; // error?
                    }

                    // pick first available
                    var slots = Object.keys(inventory);
                    for (var s = 0, slen = slots.length; s < slen; s++) {
                        if (slots[s].search(/slot/) === 0 && inventory[slots[s]] === null) {
                            slot = slots[s];
                            break;
                        }
                    }

                    return slot;
                },
                addItem: function(entity, item, slot) {
                    var inventory = entity.getComponent('inventory');
                    if (!inventory) {
                        return; // error?
                    }

                    if (!slot) {
                        // pick first available
                        slot = this.findEmptySlot(entity);
                    }

                    // still don't have a slot
                    if (!slot) {
                        // no room in inventory
                        return; // error?
                    }

                    // now we can add the item to the slot
                    inventory[slot] = item;

                    this.onItemAdded.emit(entity, item, slot);
                },
                removeItem: function(entity, slot) {
                    var inventory = entity.getComponent('inventory');
                    if (!inventory) {
                        return; // error?
                    }

                    if (!inventory[slot]) {
                        return; // no item to remove
                    }

                    var item = inventory[slot];
                    inventory[slot] = null;

                    this.onItemRemoved.emit(entity, item);
                },
                equipItem: function(entity, slot) {
                    var inventory = entity.getComponent('inventory');
                    $log.debug('equipItem: ', inventory, slot);
                    if (inventory && inventory[slot]) {
                        var itemToEquip = inventory[slot];
                        if (isEquipable(itemToEquip)) {
                            $log.debug('good to equip: ', itemToEquip, entity, slot);
                            // TODO: handle weapons
                            if (inventory[itemToEquip.type]) {
                                var currentItem = inventory[itemToEquip.type];
                                inventory[itemToEquip.type] = inventory[slot];
                                inventory[slot] = currentItem;
                            } else {
                                inventory[itemToEquip.type] = inventory[slot];
                                inventory[slot] = null;
                            }
                            this.onEquipItem.emit(entity, itemToEquip);
                        }
                    }

                    return;
                },
                unequipItem: function(entity, slot) {
                    var inventory = entity.getComponent('inventory');
                    if (inventory && inventory[slot]) {
                        var invSlot = this.findEmptySlot(entity);
                        if (invSlot) {
                            var item = inventory[slot];
                            inventory[invSlot] = item;
                            inventory[slot] = null;

                            this.onUnEquipItem.emit(entity, item, slot);
                        } else {
                            // no free slots to unequip to, drop it or do nothing?
                            return;
                        }
                    }
                },
                update: function() {

                }
            });

            return InventorySystem;
        }
    ]);
