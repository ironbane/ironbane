angular
    .module('server.systems.network', ['ces'])
    .factory('NetworkSystem', [
        'System',
        '$log',
        function(System, $log) {
            'use strict';

            function arraysAreEqual(a1, a2) {
                // TODO make more robust? this is just for transforms right now
                return (a1[0] === a2[0]) && (a1[1] === a2[1]) && (a1[2] === a2[2]);
            }

            function onRecieveTransforms(packet) {
                var sender = this.userId,
                    world = this.world,
                    netEntities = world.getEntities('netRecv');

                // TODO: might be better instead to just find them by ID? not sure which search is faster
                // (and then test they have the netRecv component)
                netEntities.forEach(function(entity) {
                    var netComponent = entity.getComponent('netRecv');

                    // most likely this should be one per client, however perhaps other player owned things
                    // may come
                    if (packet[entity.uuid]) { // && entity.owner === sender) {
                        entity.position.deserialize(packet[entity.uuid].pos);
                        entity.rotation.deserialize(packet[entity.uuid].rot);
                    }
                });
            }

            function onNetSendEntityAdded(entity) {
                // hook into the entity's events for component mgmt
                entity.onComponentAdded.add(this.entityComponentAddedHandler);
                entity.onComponentRemoved.add(this.entityComponentRemovedHandler);

                this.sendNetState(null, entity);
            }

            function onNetSendEntityRemoved(entity) {
                entity.onComponentAdded.remove(this.entityComponentAddedHandler);
                entity.onComponentRemoved.remove(this.entityComponentRemovedHandler);

                // since we're syncing up the server's uuid, just send that
                this._stream.emit('remove', entity.uuid);
            }

            var NetworkSystem = System.extend({
                init: function() {
                    this._super();

                    // we want to get a bound ref so that it can be removed
                    this.entityComponentAddedHandler = this._entityCAH.bind(this);
                    this.entityComponentRemovedHandler = this._entityCRH.bind(this);
                },
                addedToWorld: function(world) {
                    var self = this;

                    this._super(world);

                    // each world should have its own network stream
                    this._stream = new Meteor.Stream(world.name + '_entities');

                    this._stream.permissions.write(function(eventName) {
                        if (eventName === 'add') {
                            return false;
                        }

                        return true;
                    });

                    this._stream.permissions.read(function(eventName) {
                        return true;
                    });

                    this._stream.on('transforms', onRecieveTransforms.bind(this));

                    // a client may request a full state update (typically this should be for bootup, TODO somehow throttle this so that we don't get hammered)
                    this._stream.on('getState', function() {
                        $log.debug('server getState: ', this.userId, this.subscriptionId);
                        var netEnts = _.filter(self.world.getEntities('netSend'), function(ent) { return !ent.isLoadedFromJsonFile; });
                        self.sendNetState(this.userId, netEnts);
                    });

                    this._stream.on('inventory:equipItem', function(data) {
                        var inv = world.getSystem('inventory'),
                            netents = world.getEntities('netRecv'),
                            entity = _.findWhere(netents, {uuid: data.entityId});

                        $log.debug('inventory:equipItem', entity.name, data.sourceSlot, data.targetSlot);

                        if (entity) {
                            inv.equipItem(entity, data.sourceSlot, data.targetSlot);
                        }
                    });

                    world.subscribe('inventory:equipItem', function(entity, sourceSlot, targetSlot) {
                        if (entity.hasComponent('netSend') && self._stream) {
                            // var inv = entity.getComponent('inventory');
                            // self._stream.emit('inventory:snapshot', {entityId: entity.uuid, snapshot: inv.serializeNet()});
                            self._stream.emit('inventory:equipItem', {
                                entityId: entity.uuid,
                                sourceSlot: sourceSlot,
                                targetSlot: targetSlot
                            });
                        }
                    });

                    world.subscribe('inventory:onItemAdded', function(entity, item, slot) {
                        if (entity.hasComponent('netSend') && self._stream) {
                            self._stream.emit('inventory:onItemAdded', {
                                entityId: entity.uuid,
                                item: item,
                                slot: slot
                            });
                        }
                    });

                    world.subscribe('inventory:onItemRemoved', function(entity, item) {
                        if (entity.hasComponent('netSend') && self._stream) {
                            self._stream.emit('inventory:onItemRemoved', {entityId: entity.uuid, itemId: item.uuid});
                        }
                    });

                    this._stream.on('inventory:dropItem', function(data) {
                        var inv = world.getSystem('inventory'),
                            netents = world.getEntities('netSend'),
                            entity = _.findWhere(netents, {uuid: data.entityId})

                        if (!entity) {
                            $log.error('[inventory:dropItem] entity not found!');
                            return;
                        }

                        if (entity.owner !== this.userId) {
                            $log.error('[inventory:dropItem] entity has wrong owner!');
                            return;
                        }

                        var inventoryComponent = entity.getComponent('inventory');
                        if (!inventoryComponent) {
                            $log.error('[inventory:dropItem] entity has no inventory!');
                            return;
                        }

                        var item = inv.findItemByUuid(entity, data.itemUuid);
                        if (!item) {
                            $log.error('[inventory:dropItem] uuid not found!');
                            return;
                        }

                        inv.dropItem(entity, item);
                    });

                    this._stream.on('pickup:entity', function(data) {
                        var inv = world.getSystem('inventory'),
                            netents = world.getEntities('netSend'),
                            pickupents = world.getEntities('pickup'),
                            entity = _.findWhere(netents, {uuid: data.entityId}),
                            pickup = _.findWhere(pickupents, {uuid: data.pickupId});

                        if (!entity) {
                            $log.error('[pickup:entity] entity not found!');
                            return;
                        }

                        if (entity.owner !== this.userId) {
                            $log.error('[pickup:entity] entity has wrong owner');
                            return;
                        }

                        var freeSlot = inv.findEmptySlot(entity);
                        if (!freeSlot) {
                            return;
                        }

                        if (!pickup) {
                            $log.error('[pickup:entity] pickup not found!');
                            return;
                        }

                        var pickupComponent = pickup.getComponent('pickup');

                        if (pickupComponent) {
                            world.removeEntity(pickup);
                            inv.addItem(entity, pickupComponent.item);

                            $log.log('picking up item ' + pickupComponent.item.name);
                        }
                    });

                    // currently the server does not attack and check vector
                    this._stream.on('combat:primaryAttack', function(data) {
                        // just send it back out to everyone
                        // self._stream.emit('combat:primaryAttack', data);
                    });


                    this._stream.on('fighter:jump', function(data) {
                        // just send it back out to everyone
                        // self._stream.emit('fighter:jump', data);
                    });

                    // currently the server does not attack and check vector
                    this._stream.on('combat:damageEntity', function(data) {
                        // victimEntityUuid: victimEntity.uuid,
                        // ownerEntityUuid: ownerEntity.uuid,
                        // damage: damage
                        var damageableEntities = world.getEntities('damageable');

                        var victimEntity = _.findWhere(damageableEntities, {
                            uuid: data.victimEntityUuid
                        });
                        var sourceEntity = _.findWhere(damageableEntities, {
                            uuid: data.sourceEntityUuid
                        });

                        var playerEntities = world.getEntities('player');
                        var playerChar = _.findWhere(playerEntities, {
                            owner: this.userId
                        });

                        if (!playerChar) {
                            $log.error('player entity not found!');
                            return;
                        }

                        if (!_.isNumber(data.damage)) {
                            $log.error('data.damage must be a number!');
                        }

                        if (data.damage <= 0) {
                            $log.error('data.damage must be > 0!');
                        }

                        if (victimEntity === playerChar || sourceEntity === playerChar) {
                            var damageableComponent = victimEntity.getComponent('damageable');

                            // TODO very naive! Add anti-cheat measures later
                            if (damageableComponent) {
                                damageableComponent.sources.push({
                                    sourceEntity: sourceEntity,
                                    type: 'damage',
                                    damage: data.damage
                                });

                                // TODO for some reason emits *are* being sent even though
                                // they are not being sent here, not sure why
                                //self._stream.emit('combat:damageEntity', data);
                            }
                        }
                    });

                    world.entityAdded('netSend').add(onNetSendEntityAdded.bind(this));
                    world.entityRemoved('netSend').add(onNetSendEntityRemoved.bind(this));

                    // cache streams for direct user communication
                    this._userStreams = {};

                    Accounts.onLogin(function (info) {
                        var userId = info.user._id;

                        // TODO clear when user logs out
                        if (!self._userStreams[userId]) {
                            var userStream = [userId, self.world.name, 'entities'].join('_');
                            console.log('stream: ' + userStream);
                            self._userStreams[userId] = new Meteor.Stream(userStream);
                            var stream = self._userStreams[userId];

                            stream.permissions.write(function() {
                                return this.userId === userId;
                            });

                            // can read anything the server sends
                            stream.permissions.read(function() {
                                return this.userId === userId;
                            });
                        }
                    });
                },
                sendNetState: function(userId, entities) {
                    if (!entities || (entities.length && entities.length === 0)) {
                        return;
                    }

                    if (!angular.isArray(entities)) {
                        entities = [entities];
                    }

                    var stream, packet = {};
                    if (!userId) {
                        // then send it to everyone
                        stream = this._stream;
                    } else {
                        // get user stream
                        stream = this._userStreams[userId];
                    }

                    // pack them up in a single update
                    entities.forEach(function(entity) {
                        // TODO: specific network serialization
                        var serialized = JSON.parse(JSON.stringify(entity));
                        // TODO: something is wrong with the serializer...
                        delete serialized.matrix;
                        serialized.position = entity.position.serialize();
                        serialized.rotation = entity.rotation.serialize();
                        // we should remove the networking components, and let the client decide
                        delete serialized.components.netSend;
                        delete serialized.components.netRecv;
                        packet[entity.uuid] = serialized;
                    });

                    if (Object.keys(packet).length > 0) {
                        stream.emit('add', packet);
                    }
                },
                update: function() {
                    // TODO: need to send information about add/remove components as well

                    // for now just send transform
                    var entities = this.world.getEntities('netSend'),
                        packet = {};

                    entities.forEach(function(entity) {
                        // we only want to send changed
                        // TODO: later only send "interesting" entities to each client
                        var sendComponent = entity.getComponent('netSend');
                        if (sendComponent._last) {
                            var pos = entity.position.serialize(),
                                rot = entity.rotation.serialize(),
                                lastPos = sendComponent._last.pos,
                                lastRot = sendComponent._last.rot;

                            if (!arraysAreEqual(pos, lastPos) || !arraysAreEqual(rot, lastRot)) {
                                sendComponent._last.pos = pos;
                                sendComponent._last.rot = rot;

                                packet[entity.uuid] = sendComponent._last;
                            }
                        } else {
                            sendComponent._last = {
                                pos: entity.position.serialize(),
                                rot: entity.rotation.serialize()
                            };
                            packet[entity.uuid] = sendComponent._last;
                        }
                    });

                    if (Object.keys(packet).length > 0) {
                        this._stream.emit('transforms', packet);
                    }
                },
                _entityCAH: function(entity, componentName) {
                    // when a component is added to an entity, we need to update all the clients
                    // TODO: net specific components? are there some that clients don't need to know about?
                    var component = entity.getComponent(componentName);

                    // $log.debug('cadd: ', entity.uuid, component.serializeNet());

                    this._stream.emit('cadd', entity.uuid, component.serializeNet());
                },
                _entityCRH: function(entity, componentName) {
                    // when a component is added to an entity, we need to update all the clients
                    // TODO: net specific components? are there some that clients don't need to know about?
                    this._stream.emit('cremove', entity.uuid, componentName);
                }
            });

            return NetworkSystem;
        }
    ]);
