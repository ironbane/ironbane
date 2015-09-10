angular
    .module('server.systems.network', [
        'ces',
        'three',
        'server.services.chat'
    ])
    .factory('NetworkSystem', [
        'System',
        '$log',
        'ChatService',
        'THREE',
        function(System, $log, ChatService, THREE) {
            'use strict';

            function arraysAreEqual(a1, a2) {
                // TODO make more robust? this is just for transforms right now
                return (a1[0] === a2[0]) && (a1[1] === a2[1]) && (a1[2] === a2[2]);
            }

            function onNetSendEntityAdded(entity) {
                // hook into the entity's events for component mgmt
                entity.onComponentAdded.add(this.entityComponentAddedHandler);
                entity.onComponentRemoved.add(this.entityComponentRemovedHandler);

                // Maintain a list of entities we know about
                var netSendComponent = entity.getComponent('netSend');
                netSendComponent.__knownEntities = [];
            }

            function onNetSendEntityRemoved(entity) {
                entity.onComponentAdded.remove(this.entityComponentAddedHandler);
                entity.onComponentRemoved.remove(this.entityComponentRemovedHandler);

                // since we're syncing up the server's uuid, just send that
                // this._stream.emit('remove', entity.uuid);
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


                    // this._stream.on('inventory:equipItem', function(data) {
                    //     var inv = world.getSystem('inventory'),
                    //         netents = world.getEntities('netRecv'),
                    //         entity = _.findWhere(netents, {uuid: data.entityId});

                    //     // $log.debug('inventory:equipItem', entity.name, data.sourceSlot, data.targetSlot);

                    //     if (entity) {
                    //         inv.equipItem(entity, data.sourceSlot, data.targetSlot);
                    //     }
                    // });

                    // this._stream.on('inventory:useItem', function(data) {
                    //     var inv = world.getSystem('inventory'),
                    //         netents = world.getEntities('netSend'),
                    //         entity = _.findWhere(netents, {uuid: data.entityId})

                    //     if (!entity) {
                    //         $log.error('[inventory:dropItem] entity not found!');
                    //         return;
                    //     }

                    //     if (entity.owner !== this.userId) {
                    //         $log.error('[inventory:dropItem] entity has wrong owner!');
                    //         return;
                    //     }

                    //     var inventoryComponent = entity.getComponent('inventory');
                    //     if (!inventoryComponent) {
                    //         $log.error('[inventory:dropItem] entity has no inventory!');
                    //         return;
                    //     }

                    //     var item = inv.findItemByUuid(entity, data.itemUuid);
                    //     if (!item) {
                    //         $log.error('[inventory:dropItem] uuid not found!');
                    //         return;
                    //     }

                    //     inv.useItem(entity, item);
                    // });

                    // world.subscribe('inventory:equipItem', function(entity, sourceSlot, targetSlot) {
                    //     if (entity.hasComponent('netSend') && self._stream) {
                    //         // var inv = entity.getComponent('inventory');
                    //         // self._stream.emit('inventory:snapshot', {entityId: entity.uuid, snapshot: inv.serializeNet()});
                    //         // self._stream.emit('inventory:equipItem', {
                    //         //     entityId: entity.uuid,
                    //         //     sourceSlot: sourceSlot,
                    //         //     targetSlot: targetSlot
                    //         // });
                    //     }
                    // });

                    // world.subscribe('inventory:onItemAdded', function(entity, item, slot) {
                    //     if (entity.hasComponent('netSend') && self._stream) {
                    //         self._stream.emit('inventory:onItemAdded', {
                    //             entityId: entity.uuid,
                    //             item: item,
                    //             slot: slot
                    //         });
                    //     }
                    // });

                    // world.subscribe('inventory:onItemRemoved', function(entity, item) {
                    //     if (entity.hasComponent('netSend') && self._stream) {
                    //         self._stream.emit('inventory:onItemRemoved', {entityId: entity.uuid, itemId: item.uuid});
                    //     }
                    // });

                    // this._stream.on('inventory:dropItem', function(data) {
                    //     var inv = world.getSystem('inventory'),
                    //         netents = world.getEntities('netSend'),
                    //         entity = _.findWhere(netents, {uuid: data.entityId})

                    //     if (!entity) {
                    //         $log.error('[inventory:dropItem] entity not found!');
                    //         return;
                    //     }

                    //     if (entity.owner !== this.userId) {
                    //         $log.error('[inventory:dropItem] entity has wrong owner!');
                    //         return;
                    //     }

                    //     var inventoryComponent = entity.getComponent('inventory');
                    //     if (!inventoryComponent) {
                    //         $log.error('[inventory:dropItem] entity has no inventory!');
                    //         return;
                    //     }

                    //     var item = inv.findItemByUuid(entity, data.itemUuid);
                    //     if (!item) {
                    //         $log.error('[inventory:dropItem] uuid not found!');
                    //         return;
                    //     }

                    //     inv.dropItem(entity, item);
                    // });

                    // this._stream.on('pickup:entity', function(data) {
                    //     var inv = world.getSystem('inventory'),
                    //         netents = world.getEntities('netSend'),
                    //         pickupents = world.getEntities('pickup'),
                    //         entity = _.findWhere(netents, {uuid: data.entityId}),
                    //         pickup = _.findWhere(pickupents, {uuid: data.pickupId});

                    //     if (!entity) {
                    //         $log.error('[pickup:entity] entity not found!');
                    //         return;
                    //     }

                    //     if (entity.owner !== this.userId) {
                    //         $log.error('[pickup:entity] entity has wrong owner');
                    //         return;
                    //     }

                    //     var freeSlot = inv.findEmptySlot(entity);
                    //     if (!freeSlot) {
                    //         return;
                    //     }

                    //     if (!pickup) {
                    //         $log.error('[pickup:entity] pickup not found!');
                    //         return;
                    //     }

                    //     var pickupComponent = pickup.getComponent('pickup');

                    //     if (pickupComponent) {
                    //         world.removeEntity(pickup);
                    //         inv.addItem(entity, pickupComponent.item);

                    //         // $log.log('picking up item ' + pickupComponent.item.name);
                    //     }
                    // });

                    // currently the server does not attack and check vector
                    // this._stream.on('combat:primaryAttack', function(data) {
                    //     // just send it back out to everyone
                    //     // self._stream.emit('combat:primaryAttack', data);
                    // });


                    // this._stream.on('fighter:jump', function(data) {
                    //     // just send it back out to everyone
                    //     // self._stream.emit('fighter:jump', data);
                    // });

                    // currently the server does not attack and check vector
                    // this._stream.on('combat:damageEntity', function(data) {
                    //     // victimEntityUuid: victimEntity.uuid,
                    //     // ownerEntityUuid: ownerEntity.uuid,
                    //     // damage: damage
                    //     var damageableEntities = world.getEntities('damageable');

                    //     var victimEntity = _.findWhere(damageableEntities, {
                    //         uuid: data.victimEntityUuid
                    //     });
                    //     var sourceEntity = _.findWhere(damageableEntities, {
                    //         uuid: data.sourceEntityUuid
                    //     });

                    //     var playerEntities = world.getEntities('player');
                    //     var playerChar = _.findWhere(playerEntities, {
                    //         owner: this.userId
                    //     });

                    //     if (!playerChar) {
                    //         $log.error('player entity not found!');
                    //         return;
                    //     }

                    //     if (!victimEntity) {
                    //         $log.error('victim entity not found!');
                    //         return;
                    //     }

                    //     if (!sourceEntity) {
                    //         $log.error('source entity not found!');
                    //         return;
                    //     }

                    //     if (!_.isNumber(data.damage)) {
                    //         $log.error('data.damage must be a number!');
                    //     }

                    //     if (data.damage <= 0) {
                    //         $log.error('data.damage must be > 0!');
                    //     }

                    //     if (victimEntity === playerChar || sourceEntity === playerChar) {
                    //         var damageableComponent = victimEntity.getComponent('damageable');

                    //         // TODO very naive! Add anti-cheat measures later
                    //         if (damageableComponent) {
                    //             damageableComponent.sources.push({
                    //                 sourceEntity: sourceEntity,
                    //                 type: 'damage',
                    //                 damage: data.damage
                    //             });

                    //             // TODO for some reason emits *are* being sent even though
                    //             // they are not being sent here, not sure why
                    //             //self._stream.emit('combat:damageEntity', data);
                    //         }
                    //     }
                    // });



                    // Because we're unable to delete streams, we need to cache and reuse them
                    var streams = {};

                    Meteor.users.find({
                        'status.online': true
                    }).observe({
                        added: function(user) {
                            var streamName = [user._id, 'entities'].join('_');

                            if (!streams[streamName]) {
                                streams[streamName] = new Meteor.Stream(streamName);
                            }
                        }
                    });

                    world.entityAdded('netSend', 'player').add(function (entity) {
                        var streamName = [entity.owner, 'entities'].join('_');

                        if (!streams[streamName]) {
                            console.error('stream not found:', streamName);
                            return;
                        }

                        entity.stream = streams[streamName];

                        entity.stream.permissions.write(function() {
                            return this.userId === entity.owner;
                        });

                        // can read anything the server sends
                        entity.stream.permissions.read(function() {
                            return this.userId === entity.owner;
                        });

                        var packet = {};

                        var serialized = JSON.parse(JSON.stringify(entity));
                        // TODO: something is wrong with the serializer...
                        delete serialized.matrix;
                        serialized.position = entity.position.serialize();
                        serialized.rotation = entity.rotation.serialize();
                        // we should remove the networking components, and let the client decide
                        delete serialized.components.netSend;
                        delete serialized.components.netRecv;
                        packet[entity.uuid] = serialized;

                        // setTimeout(function () {
                        entity.stream.emit('add', packet);
                        // }, 1000);

                        ChatService.announce(entity.name + ' has entered the world.', {
                            join: true
                        });

                        entity.stream.on('transforms', function (packet) {
                            var netEntities = world.getEntities('netRecv');

                            // TODO: might be better instead to just find them by ID? not sure which search is faster
                            // (and then test they have the netRecv component)
                            netEntities.forEach(function(netEntity) {
                                var netComponent = entity.getComponent('netRecv');

                                // most likely this should be one per client, however perhaps other player owned things
                                // may come
                                if (packet[netEntity.uuid] && netEntity.owner === entity.owner) {
                                    var newPos = new THREE.Vector3();

                                    newPos.deserialize(packet[netEntity.uuid].pos);

                                    // Some anti-cheat
                                    if (newPos.distanceToSquared(netEntity.position) < 5*5) {
                                        netEntity.position.deserialize(packet[netEntity.uuid].pos);
                                        // netEntity.rotation.deserialize(packet[netEntity.uuid].rot);
                                    }
                                    else {
                                        // TODO Disconnect? Keep track of cheat count?
                                    }

                                }
                            });
                        });

                    });

                    world.entityRemoved('netSend', 'player').add(function (entity) {

                        ChatService.announce(entity.name + ' has left the world.', {
                            leave: true
                        });

                        // setTimeout(function () {
                        entity.stream.emit('remove', entity.uuid);
                        // }, 1000);

                        // entity.stream.close();
                        // delete entity.stream;
                    });

                    world.entityAdded('netSend').add(onNetSendEntityAdded.bind(this));
                    world.entityRemoved('netSend').add(onNetSendEntityRemoved.bind(this));

                },
                update: function() {

                    // for now just send transform
                    var entities = this.world.getEntities('netSend');
                    var otherEntities = entities;
                    entities.forEach(function(entity) {
                        var sendComponent = entity.getComponent('netSend');

                        var knownEntities = [];
                        otherEntities.forEach(function(otherEntity) {
                            if (entity === otherEntity) {
                                return;
                            }

                            if (entity.level === otherEntity.level &&
                                entity.position.distanceToSquared(otherEntity.position) < 20 * 20) {
                                knownEntities.push(otherEntity);
                            }
                        });

                        // if (entity.hasComponent('player')) {
                        //     console.log(knownEntities.map(function (e) {
                        //         return e.name;
                        //     }), knownEntities.map(function (e) {
                        //         return e.position.distanceTo(entity.position);
                        //     }));
                        // }

                        if (entity.hasComponent('player')) {
                            _.each(sendComponent.__knownEntities, function (knownEntity) {
                                if (!_.contains(knownEntities, knownEntity)) {
                                    entity.stream.emit('remove', knownEntity.uuid);
                                    console.log('SEND remove to', entity.name, knownEntity.name);
                                }
                            });

                            _.each(knownEntities, function (knownEntity) {
                                if (!_.contains(sendComponent.__knownEntities, knownEntity)) {
                                    var packet = {};

                                    var serialized = JSON.parse(JSON.stringify(knownEntity));
                                    // TODO: something is wrong with the serializer...
                                    delete serialized.matrix;
                                    serialized.position = knownEntity.position.serialize();
                                    serialized.rotation = knownEntity.rotation.serialize();
                                    // we should remove the networking components, and let the client decide
                                    delete serialized.components.netSend;
                                    delete serialized.components.netRecv;
                                    packet[knownEntity.uuid] = serialized;

                                    entity.stream.emit('add', packet);
                                    console.log('SEND add to', entity.name, serialized.name);
                                }
                            });
                        }

                        sendComponent.__knownEntities = knownEntities;

                        if (entity.hasComponent('player')) {
                            sendComponent.__knownEntities.forEach(function (knownEntity) {
                                var packet = {};
                                if (sendComponent._last) {
                                    var pos = knownEntity.position.serialize(),
                                        rot = knownEntity.rotation.serialize(),
                                        lastPos = sendComponent._last.pos,
                                        lastRot = sendComponent._last.rot;

                                    if (!arraysAreEqual(pos, lastPos) || !arraysAreEqual(rot, lastRot)) {
                                        sendComponent._last.pos = pos;
                                        sendComponent._last.rot = rot;

                                        packet[knownEntity.uuid] = sendComponent._last;
                                    }
                                } else {
                                    sendComponent._last = {
                                        pos: knownEntity.position.serialize(),
                                        rot: knownEntity.rotation.serialize()
                                    };
                                    packet[knownEntity.uuid] = sendComponent._last;
                                }

                                if (Object.keys(packet).length > 0) {
                                    entity.stream.emit('transforms', packet);
                                }
                            })
                        }

                    });
                },
                _entityCAH: function(entity, componentName) {
                    console.log('cadd', entity.name, componentName);
                    var component = entity.getComponent(componentName);

                    var sendComponent = entity.getComponent('netSend');
                    sendComponent.__knownEntities.forEach(function(knownEntity) {
                        if (knownEntity.hasComponent('player')) {
                            console.log('SEND cadd to', knownEntity.name, component.serializeNet());
                            knownEntity.stream.emit('cadd', entity.uuid, component.serializeNet());
                        }
                    });
                },
                _entityCRH: function(entity, componentName) {
                    console.log('cremove', entity.name, componentName);
                    var component = entity.getComponent(componentName);

                    var sendComponent = entity.getComponent('netSend');
                    sendComponent.__knownEntities.forEach(function(knownEntity) {
                        if (knownEntity.hasComponent('player')) {
                            console.log('SEND cremove to', knownEntity.name, componentName);
                            knownEntity.stream.emit('cremove', entity.uuid, componentName);
                        }
                    });
                },
                updateComponent: function(entity, componentName) {
                    var component = entity.getComponent(componentName);

                    var sendComponent = entity.getComponent('netSend');
                    sendComponent.__knownEntities.forEach(function(knownEntity) {
                        if (knownEntity.hasComponent('player')) {
                            knownEntity.stream.emit('cupdate', entity.uuid, component.serializeNet(), componentName);
                        }
                    });
                }
            });

            return NetworkSystem;
        }
    ]);
