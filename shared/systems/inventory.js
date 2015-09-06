angular
    .module('systems.inventory', [
        'ces',
        'engine.entity-builder',
        'engine.util',
        'engine.timing'
    ])
    .factory('InventorySystem', [
        '$log',
        'System',
        'Signal',
        'EntityBuilder',
        'IbUtils',
        'Timer',
        function($log, System, Signal, EntityBuilder, IbUtils, Timer) {
            'use strict';

            var isEquipable = function(item) {
                return item.type === 'head' || item.type === 'body' || item.type === 'feet' || item.type === 'relic' ||
                    item.type.search(/weapon/ig) >= 0 || item.type === 'shield';
            };

            var InventorySystem = System.extend({
                init: function() {
                    this._super();

                    this.onEquipItem = new Signal();
                    this.onUnEquipItem = new Signal();
                    this.onItemAdded = new Signal();
                    this.onItemRemoved = new Signal();

                    this._pickupTimer = new Timer(0.5);
                },
                addedToWorld: function(world) {
                    this._super(world);

                    var inventory = this;

                    world.subscribe('inventory:drop', inventory.dropItem.bind(inventory));
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
                        $log.debug('wanted to add ', item, 'but no slots!');
                        return; // error?
                    }

                    // now we can add the item to the slot
                    inventory[slot] = item;

                    this.world.publish('inventory:onItemAdded', entity, item, slot);
                    this.onItemAdded.emit(entity, item, slot);
                },
                removeItem: function(entity, slot) {
                    var inventory = entity.getComponent('inventory');
                    if (!inventory) {
                        return null; // error?
                    }

                    if (!inventory[slot]) {
                        return null; // no item to remove
                    }

                    var item = inventory[slot];
                    inventory[slot] = null;

                    this.world.publish('inventory:onItemRemoved', entity, item);
                    this.onItemRemoved.emit(entity, item);

                    return item;
                },
                dropItem: function(entity, slot) {
                    $log.debug('inventory.dropItem', entity.uuid, slot);

                    var world = this.world,
                        inventory = this,
                        dropped;

                    function buildPickup(item) {
                        var image = item.invImage ? item.invImage : item.image;
                        var pickup = EntityBuilder.build('pickup: ' + item.name, {
                            components: {
                                quad: {
                                    transparent: true,
                                    texture: 'images/spritesheets/items.png',
                                    numberOfSpritesH: 16,
                                    numberOfSpritesV: 128,
                                    width: 0.5,
                                    height: 0.5,
                                    indexH: IbUtils.spriteSheetIdToXY(image).h,
                                    indexV: IbUtils.spriteSheetIdToXY(image).v
                                },
                                shadow: {
                                    simple: true
                                },
                                pickup: {
                                    item: item
                                }
                            }
                        });

                        return pickup;
                    }

                    function dropItemInWorld(item) {
                        dropped = buildPickup(item);
                        dropped._droppedBy = entity.uuid;
                        dropped.position.copy(entity.position);
                        // move it a little because of many
                        // TODO: launch random projectiles? better spread algorithm
                        dropped.position.x += Math.random();
                        dropped.position.z += Math.random();
                        world.addEntity(dropped);

                        $log.debug('drop item: ', entity.uuid, dropped.name, item);
                    }

                    var item;
                    if (slot === 'all_slots') {
                        for (var i = 0; i < 8; i++) {
                            item = this.removeItem(entity, 'slot' + i);
                            if (item) {
                                dropItemInWorld(item);
                            }
                        }
                    } else if (slot === 'all_equipped') {
                        // TODO
                    } else if (slot === 'all') {
                        // TODO
                    } else {
                        item = inventory.removeItem(entity, slot);
                        if (item) {
                            dropItemInWorld(item);
                        }
                    }
                },
                equipItem: function(entity, slot) {
                    var inventory = entity.getComponent('inventory');
                    //$log.debug('equipItem: ', entity.uuid, inventory, slot);
                    if (inventory && inventory[slot]) {
                        var itemToEquip = inventory[slot];
                        if (isEquipable(itemToEquip)) {
                            //$log.debug('good to equip: ', itemToEquip, entity.uuid, slot);
                            var equipSlot;

                            if (itemToEquip.type === 'weapon') {
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

                            // TODO: handle 2hweapon

                            if (itemToEquip.type === 'shield') {
                                equipSlot = 'lhand';
                            }

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
                                inventory[equipSlot] = itemToEquip;
                                inventory[slot] = currentItem;
                            } else {
                                inventory[equipSlot] = itemToEquip;
                                inventory[slot] = null;
                            }

                            //$log.debug('inventory adjusted: ', inventory);

                            this.world.publish('inventory:onEquipItem', entity, itemToEquip, equipSlot, slot);
                            this.onEquipItem.emit(entity, itemToEquip, equipSlot, slot);
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

                            this.world.publish('inventory:onUnEquipItem', entity, item, slot, invSlot);
                            this.onUnEquipItem.emit(entity, item, slot, invSlot);
                        } else {
                            // no free slots to unequip to, drop it or do nothing?
                            return;
                        }
                    }
                },
                update: function() {
                    // you have to have inventory to pickup inventory
                    // for now, lets keep it to players only
                    var invSystem = this;

                    var lootDroppers = invSystem.world.getEntities('inventory', 'health');
                    // TODO: !player
                    lootDroppers.forEach(function(entity) {
                        var health = entity.getComponent('health');
                        if (health.value <= 0) {
                            // dead drop all loot
                            invSystem.dropItem(entity, 'all_slots');
                        }
                    });

                    if (invSystem._pickupTimer.isExpired) {
                        //$log.debug('pickup scan');

                        var grabbers = this.world.getEntities('inventory', 'player'),
                            pickups = this.world.getEntities('pickup');

                        grabbers.forEach(function(entity) {
                            // TODO: some sort of spacial awareness so that it's not always the first in the array that wins
                            pickups.forEach(function(pickup) {
                                //$log.debug('pickup hunting: ', entity, pickups);
                                if (entity.position.inRangeOf(pickup.position, 0.25)) {
                                    $log.debug('picking up: ', entity.name, ' -> ', pickup.name);
                                    invSystem.addItem(entity, pickup.getComponent('pickup').item);
                                    invSystem.world.removeEntity(pickup);
                                }
                            });
                        });

                        invSystem._pickupTimer.reset();
                    }
                }
            });

            return InventorySystem;
        }
    ]);
