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
                            var equipSlot;

                            if(itemToEquip.type === 'weapon') {
                                if (itemToEquip.handedness === 'r') { // specifically weapon must be right hand
                                    equipSlot = 'rhand';
                                } else if (itemToEquip.handedness === 'l') { // specifically weapon must be left hand
                                    equipSlot = 'lhand';
                                } else if (itemToEquip.handedness === '1' || !itemToEquip.handedness) { // either hand
                                    // first check right
                                    if (inventory['rhand']) {
                                        if (inventory['lhand']) {
                                            equipSlot = 'rhand'; // the idea here is that we'll always replace right (for now, later deal with shields)
                                        } else {
                                            equipSlot = 'lhand';
                                        }
                                    } else {
                                        equipSlot = 'rhand';
                                    }
                                } else {
                                    // some other kind of weapon (2hweapon)
                                    equipSlot = '2hweapon';
                                }
                            } else {
                                equipSlot = itemToEquip.type;
                            }

                            // TODO: handle 2hweapon && shields

                            if (equipSlot === 'relic') {
                                // find open relic slot (TODO: support more than 3 here)
                                if (inventory['relic1']) {
                                    if (inventory['relic2']) {
                                        if (inventory['relic3']) {
                                            equipSlot = 'relic1'; // again for now just replace 1 when they are full
                                        } else {
                                            equipSlot = 'relic3';
                                        }
                                    } else {
                                        equipSlot = 'relic2';
                                    }
                                } else {
                                    equipSlot = 'relic1';
                                }
                            }

                            if (inventory[equipSlot]) {
                                var currentItem = inventory[equipSlot];
                                inventory[equipSlot] = inventory[slot];
                                inventory[slot] = currentItem;
                            } else {
                                inventory[equipSlot] = inventory[slot];
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
