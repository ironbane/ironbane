angular
    .module('systems.inventory', [
        'ces',
        'three',
        'engine.entity-builder',
        'engine.util',
        'engine.timing',
        'game.services.globalsound'
    ])
    .factory('InventorySystem', [
        '$log',
        'System',
        'Signal',
        'EntityBuilder',
        'IbUtils',
        'Timer',
        '$components',
        'THREE',
        'GlobalSound',
        function($log, System, Signal, EntityBuilder, IbUtils, Timer, $components, THREE, GlobalSound) {
            'use strict';

            var isEquipable = function(item) {
                return item.type === 'head' || item.type === 'body' || item.type === 'feet' || item.type === 'relic' ||
                    item.type.search(/weapon/ig) >= 0 || item.type === 'shield';
            };

            var armorList = [
                'head',
                'body',
                'feet',
                'rhand',
                'lhand',
                'relic1',
                'relic2',
                'relic3',
            ];

            var slotList = [
                'slot0',
                'slot1',
                'slot2',
                'slot3',
                'slot4',
                'slot5',
                'slot6',
                'slot7'
            ];

            var invSlotList = armorList.concat(slotList);

            var InventorySystem = System.extend({
                init: function() {
                    this._super();

                    this.onEquipItem = new Signal();
                    this.onItemAdded = new Signal();
                    this.onItemRemoved = new Signal();

                    this._pickupTimer = new Timer(0.5);
                },
                addedToWorld: function(world) {
                    this._super(world);

                    var inventory = this;

                    // world.subscribe('inventory:drop', inventory.dropItem.bind(inventory));

                    world.entityAdded('inventory').add(function(entity) {
                        var inventoryComponent = entity.getComponent('inventory');
                        world.publish('inventory:load', entity);
                    });
                },
                findEmptySlot: function(entity) {
                    var inventory = entity.getComponent('inventory'),
                        slot = null;

                    if (!inventory) {
                        return slot; // error?
                    }

                    // pick first available
                    var slots = invSlotList;
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

                    console.log('addItem', entity, item, slot);

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

                    if (Meteor.isClient) {
                        GlobalSound.play(_.sample(['pickup']), entity.position);
                    }

                    // if (Meteor.isServer) {
                        this.world.publish('inventory:onItemAdded', entity, item, slot);
                    // }

                    this.onItemAdded.emit(entity, item, slot);
                },
                findItemByUuid: function(entity, uuid) {
                    var inventory = entity.getComponent('inventory');
                    if (!inventory) {
                        return null; // error?
                    }

                    var me = this;

                    var found = null;
                    _.each(invSlotList, function (slotName) {
                        var slotItem = inventory[slotName];
                        if (slotItem && slotItem.uuid === uuid) {
                            found = slotItem;
                        }
                    });

                    return found;
                },
                removeItem: function(entity, item) {
                    var inventory = entity.getComponent('inventory');
                    if (!inventory) {
                        return null; // error?
                    }

                    // console.log('removeItem', entity, item);

                    var me = this;

                    _.each(invSlotList, function (slotName) {
                        var slotItem = inventory[slotName];
                        if (slotItem && slotItem.uuid === item.uuid) {
                            inventory[slotName] = null;

                            me.world.publish('inventory:onItemRemoved', entity, item, slotName);

                            me.onItemRemoved.emit(entity, item);
                        }
                    });
                },
                loopItems: function(entity, fn, list) {
                    var slotNames = invSlotList;
                    if (list === 'equipment') {
                        slotNames = armorList;
                    }
                    if (list === 'slots') {
                        slotNames = slotList;
                    }
                    var inventoryComponent = entity.getComponent('inventory');
                    if (inventoryComponent) {
                        _.each(slotNames, function (slotName) {
                            var slotItem = inventoryComponent[slotName];
                            if (slotItem) {
                                fn(slotItem, slotName);
                            }
                        });
                    }
                },
                dropAll: function(entity) {
                    var inventory = entity.getComponent('inventory');
                    if (!inventory) {
                        return null; // error?
                    }

                    var me = this;

                    _.each(invSlotList, function (slotName) {
                        var item = inventory[slotName];
                        if (item) {
                            var chance = IbUtils.getRandomInt(0, 100);
                            console.log(item.dropChance, chance);
                            if (item.dropChance > chance) {
                                console.log('dropping:', item.dropChance, ' > ', chance);
                                me.dropItem(entity, item);
                            }
                        }
                    });

                },
                dropItem: function(entity, item, dropStyle) {
                    // $log.debug('inventory.dropItem', entity.uuid, item);

                    var world = this.world,
                        me = this,
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
                                    simple: true,
                                    simpleHeight: 0.49
                                },
                                pickup: {
                                    item: item
                                },
                                netSend: {},
                                teleport: {
                                    targetEntityUuid: entity.uuid,
                                    offsetPosition: IbUtils.getRandomVector3(new THREE.Vector3(), new THREE.Vector3(2, 0, 2)).normalize().multiplyScalar(1.1)
                                }
                            }
                        });

                        return pickup;
                    }

                    function dropItemInWorld(item) {
                        dropped = buildPickup(item);
                        dropped._droppedBy = entity.uuid;
                        dropped.position.copy(entity.position);

                        world.addEntity(dropped);

                        // Remove the item after a while
                        setTimeout(function () {
                            world.removeEntity(dropped);
                        }, 20000);

                        $log.debug('drop item: ', entity.uuid, dropped.name, item);
                    }

                    this.removeItem(entity, item);
                    dropItemInWorld(item);

                },
                useItem: function(entity, item) {
                    if (Meteor.isServer) {
                        if (item.type === 'food') {
                            this.removeItem(entity, item);

                            entity.addComponent('buff', {
                                type: 'heal',
                                amountPerSecond: 1,
                                duration: item.damage
                            });
                        }
                    }
                    else {
                        this.world.publish('inventory:useItem', entity, item);
                    }
                },
                equipItem: function(entity, sourceSlot, targetSlot) {
                    if (sourceSlot === targetSlot) return false;

                    var inventory = entity.getComponent('inventory');
                    //$log.debug('equipItem: ', entity.uuid, inventory, slot);
                    if (inventory) {
                        var sourceItem = inventory[sourceSlot];
                        var targetItem = inventory[targetSlot];

                        var checkSwitch = function (item, slot) {
                            if (!item) return true;

                            // Check that the change is valid
                            if (item.type === 'weapon') {
                                if (slotList.concat(['lhand','rhand']).indexOf(slot) === -1) {
                                    return false;
                                }
                            }
                            else if (item.type === 'shield') {
                                if (slotList.concat(['lhand','rhand']).indexOf(slot) === -1) {
                                    return false;
                                }
                            }
                            else if (item.type === 'relic') {
                                if (slotList.concat(['relic1','relic2','relic3']).indexOf(slot) === -1) {
                                    return false;
                                }
                            }
                            else if (item.type === 'head') {
                                if (slotList.concat(['head']).indexOf(slot) === -1) {
                                    return false;
                                }
                            }
                            else if (item.type === 'body') {
                                if (slotList.concat(['body']).indexOf(slot) === -1) {
                                    return false;
                                }
                            }
                            else if (item.type === 'feet') {
                                if (slotList.concat(['feet']).indexOf(slot) === -1) {
                                    return false;
                                }
                            }
                            else {
                                // All other stuff can only be moved between slots
                                if (slotList.indexOf(slot) === -1) {
                                    return false;
                                }
                            }

                            return true;
                        }

                        if (!checkSwitch(sourceItem, targetSlot) ||
                            !checkSwitch(targetItem, sourceSlot)) {
                            return false;
                        }


                        var temp = inventory[targetSlot];
                        inventory[targetSlot] = inventory[sourceSlot];
                        inventory[sourceSlot] = temp;

                        this.world.publish('inventory:equipItem', entity, sourceSlot, targetSlot);
                        this.onEquipItem.emit(entity, sourceSlot, targetSlot);

                        return true;
                    }

                    return false;
                },
                update: function() {

                    var me = this;

                    var invSystem = this;

                    if (Meteor.isServer) {

                        var lootDroppers = invSystem.world.getEntities('inventory', 'health');

                        lootDroppers.forEach(function(entity) {
                            var healthComponent = entity.getComponent('health');
                            if (healthComponent.value <= 0 && !healthComponent.__hasDroppedInventory && !entity.hasComponent('player')) {
                                healthComponent.__hasDroppedInventory = true;

                                invSystem.dropAll(entity);
                            }
                        });

                    }
                    if (Meteor.isClient) {
                        if (invSystem._pickupTimer.isExpired) {
                            //$log.debug('pickup scan');

                            var grabbers = this.world.getEntities('inventory', 'player'),
                                pickups = this.world.getEntities('pickup');

                            grabbers.forEach(function(entity) {
                                // TODO: some sort of spacial awareness so that it's not always the first in the array that wins
                                pickups.forEach(function(pickup) {
                                    //$log.debug('pickup hunting: ', entity, pickups);
                                    if (entity.position.inRangeOf(pickup.position, 1.0)) {
                                        $log.debug('picking up: ', entity.name, ' -> ', pickup.name);

                                        me.world.publish('pickup:entity', entity, pickup);
                                        // invSystem.world.removeEntity(pickup);
                                    }
                                });
                            });

                            invSystem._pickupTimer.reset();
                        }
                    }
                }
            });

            return InventorySystem;
        }
    ]);
