angular
    .module('server.systems.network', [
        'ces',
        'three',
        'server.services.chat',
        'global.constants.inv',
        'global.constants.game',
        'engine.timing',
        'engine.util'
    ])
    .factory('NetworkSystem', [
        'System',
        '$log',
        'ChatService',
        'THREE',
        'INV_SLOTS',
        'IB_CONSTANTS',
        'Timer',
        'IbUtils',
        function(System, $log, ChatService, THREE, INV_SLOTS, IB_CONSTANTS, Timer, IbUtils) {
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

            // Because we're unable to delete streams on the server
            // we need to cache and reuse them
            var streams = {};

            // For some reason, if we don't use setTimeout here
            // a circular dependency error is thrown
            Meteor.setTimeout(function () {
                Meteor.users.find({
                    'status.online': true,
                    'profile.server.id': Meteor.settings.server.id
                }).observe({
                    added: function(user) {
                        var streamName = IbUtils.shortMD5(user._id);

                        if (!streams[streamName]) {
                            streams[streamName] = new Meteor.Stream(streamName);
                        }
                    }
                });
            }, 0);

            var NetworkSystem = System.extend({
                init: function() {
                    this._super();

                    // we want to get a bound ref so that it can be removed
                    this.entityComponentAddedHandler = this._entityCAH.bind(this);
                    this.entityComponentRemovedHandler = this._entityCRH.bind(this);

                    this.updateFrequencyTimer = new Timer(0.5);
                },
                addedToWorld: function(world) {
                    var self = this;

                    this._super(world);

                    // world.subscribe('combat:damageEntity', function(victimEntity, sourceEntity, item) {
                    //     var totalList = [];
                    //     var sendComponentV = victimEntity.getComponent('netSend');
                    //     var sendComponentS = sourceEntity.getComponent('netRecv');

                    //     if (sendComponentV) {
                    //         totalList = totalList.concat(sendComponentV.__knownEntities);
                    //     }

                    //     if (sendComponentS) {
                    //         totalList = totalList.concat(sendComponentV.__knownEntities);
                    //     }

                    //     totalList = _.unique(totalList);

                    //     totalList.forEach(function(knownEntity) {
                    //         if (knownEntity.hasComponent('player') &&
                    //             knownEntity !== sourceEntity &&
                    //             knownEntity !== victimEntity) {
                    //             knownEntity.stream.emit('combat:damageEntity', {
                    //                 victimEntityUuid: victimEntity.uuid,
                    //                 sourceEntityUuid: sourceEntity.uuid,
                    //                 itemUuid: item.uuid
                    //             });
                    //         }
                    //     });

                    // });

                    world.subscribe('fighter:die', function(victimEntity, sourceEntity) {
                        var totalList = [];
                        var sendComponentV = victimEntity.getComponent('netSend');
                        var sendComponentS = sourceEntity.getComponent('netRecv');

                        if (sendComponentV) {
                            totalList = totalList.concat(sendComponentV.__knownEntities);
                        }

                        if (sendComponentS) {
                            totalList = totalList.concat(sendComponentV.__knownEntities);
                        }

                        totalList = _.unique(totalList);

                        totalList.forEach(function(knownEntity) {
                            if (knownEntity.hasComponent('player') &&
                                knownEntity !== sourceEntity &&
                                knownEntity !== victimEntity) {
                                knownEntity.stream.emit('fighter:die', {
                                    victimEntityUuid: victimEntity.uuid,
                                    sourceEntityUuid: sourceEntity.uuid
                                });
                            }
                        });

                    });

                    world.subscribe('fighter:updateStats', function(entity) {

                        var healthComponent = entity.getComponent('health');
                        var armorComponent = entity.getComponent('armor');

                        var sendComponent = entity.getComponent('netSend');
                        if (sendComponent) {
                            sendComponent.__knownEntities.concat([entity]).forEach(function(knownEntity) {
                                if (knownEntity.hasComponent('player')) {
                                    var data = {
                                        entityUuid: entity.uuid
                                    };
                                    if (healthComponent) {
                                        data.health = healthComponent.value;
                                    }
                                    if (armorComponent) {
                                        data.armor = armorComponent.value;
                                    }
                                    knownEntity.stream.emit('fighter:updateStats', data);
                                }
                            });
                        }

                    });

                    world.subscribe('fighter:jump', function(entity, sourceEntity) {
                        var sendComponent = entity.getComponent('netSend');
                        if (sendComponent) {
                            sendComponent.__knownEntities.forEach(function(knownEntity) {
                                if (knownEntity.hasComponent('player') && knownEntity !== sourceEntity) {
                                    knownEntity.stream.emit('fighter:jump', {
                                        entityUuid: entity.uuid
                                    });
                                }
                            });
                        }
                    });

                    world.subscribe('combat:primaryAttack', function(entity, targetVector, sourceEntity) {
                        var sendComponent = entity.getComponent('netSend');
                        if (sendComponent) {
                            sendComponent.__knownEntities.forEach(function(knownEntity) {
                                if (knownEntity.hasComponent('player') && knownEntity !== sourceEntity) {
                                    knownEntity.stream.emit('combat:primaryAttack', {
                                        entityUuid: entity.uuid,
                                        targetVector: targetVector.toArray()
                                    });
                                }
                            });
                        }
                    });

                    world.subscribe('inventory:equipItem', function(entity, sourceSlot, targetSlot) {
                        var sendComponent = entity.getComponent('netSend');
                        if (sendComponent) {
                            sendComponent.__knownEntities.forEach(function(knownEntity) {
                                if (knownEntity.hasComponent('player') && knownEntity !== entity) {
                                    knownEntity.stream.emit('inventory:equipItem', {
                                        entityUuid: entity.uuid,
                                        sourceSlot: sourceSlot,
                                        targetSlot: targetSlot
                                    });
                                }
                            });
                        }
                    });

                    world.subscribe('inventory:useItem', function(entity, item) {
                        var sendComponent = entity.getComponent('netSend');
                        if (sendComponent) {
                            sendComponent.__knownEntities.forEach(function(knownEntity) {
                                if (knownEntity.hasComponent('player') && knownEntity !== entity) {
                                    knownEntity.stream.emit('inventory:useItem', {
                                        entityUuid: entity.uuid,
                                        itemUuid: item.uuid,
                                    });
                                }
                            });
                        }
                    });

                    world.subscribe('inventory:onItemRemoved', function(entity, item) {
                        var sendComponent = entity.getComponent('netSend');
                        if (sendComponent) {
                            sendComponent.__knownEntities.concat([entity]).forEach(function(knownEntity) {
                                if (knownEntity.hasComponent('player')) {
                                    knownEntity.stream.emit('inventory:onItemRemoved', {
                                        entityUuid: entity.uuid,
                                        itemUuid: item.uuid,
                                    });
                                }
                            });
                        }
                    });

                    world.subscribe('inventory:onItemAdded', function(entity, item, slot) {
                        var sendComponent = entity.getComponent('netSend');
                        if (sendComponent) {
                            sendComponent.__knownEntities.concat([entity]).forEach(function(knownEntity) {
                                if (knownEntity.hasComponent('player')) {
                                    knownEntity.stream.emit('inventory:onItemAdded', {
                                        entityUuid: entity.uuid,
                                        item: item,
                                        slot: slot
                                    });
                                }
                            });
                        }
                    });

                    world.subscribe('inventory:onPickupGold', function(entity, item) {
                        var sendComponent = entity.getComponent('netSend');
                        if (sendComponent) {
                            sendComponent.__knownEntities.concat([entity]).forEach(function(knownEntity) {
                                if (knownEntity.hasComponent('player')) {
                                    knownEntity.stream.emit('inventory:onPickupGold', {
                                        entityUuid: entity.uuid,
                                        item: item
                                    });
                                }
                            });
                        }
                    });

                    world.entityAdded('netSend', 'player').add(function (entity) {
                        var streamName = IbUtils.shortMD5(entity.owner);

                        if (!streams[streamName]) {
                            console.error('stream not found:', streamName);
                            return;
                        }

                        entity.stream = streams[streamName];

                        entity.stream.resetListeners();

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

                        entity.stream.emit('add', packet);

                        entity.stream.on('transforms', function (packet) {
                            var netEntities = world.getEntities('netRecv');

                            if (!_.isObject(packet)) {
                                return;
                            }

                            netEntities.forEach(function(netEntity) {
                                // most likely this should be one per client, however perhaps other player owned things
                                // may come
                                if (packet[netEntity.uuid] && netEntity.owner === entity.owner) {
                                    var data = packet[netEntity.uuid];

                                    if (!_.isNumber(data.rot)) {
                                        return;
                                    }

                                    var newPos = new THREE.Vector3().fromArray(data.pos);

                                    var checkPos = newPos.clone().setY(netEntity.position.y);

                                    // Some anti-cheat
                                    if (checkPos.distanceToSquared(netEntity.position) < 10*10 ||
                                        Roles.userIsInRole(netEntity.owner, ['game-master'])) {
                                        netEntity.position.copy(newPos);
                                        netEntity.rotation.y = data.rot;
                                    }
                                    else {
                                        // TODO Disconnect? Keep track of cheat count?
                                    }

                                }
                            });
                        });

                        entity.stream.on('fighter:jump', function(data) {
                            var netEntities = world.getEntities('netRecv');

                            if (!_.isObject(data)) {
                                return;
                            }

                            netEntities.forEach(function(netEntity) {
                                if (netEntity.uuid === data.entityUuid && netEntity.owner === entity.owner) {
                                    world.publish('fighter:jump', netEntity, entity);
                                }
                            });
                        });

                        entity.stream.on('combat:primaryAttack', function(data) {
                            var netEntities = world.getEntities('netRecv');

                            if (!_.isObject(data)) {
                                return;
                            }

                            if (!_.isArray(data.targetVector)) {
                                return;
                            }

                            netEntities.forEach(function(netEntity) {
                                if (netEntity.uuid === data.entityUuid && netEntity.owner === entity.owner) {
                                    var targetVector = new THREE.Vector3().fromArray(data.targetVector);

                                    // Some anti-cheat
                                    // TODO compare with actual weapon range currently equipped?
                                    if (targetVector.distanceToSquared(netEntity.position) < 25*25) {
                                        world.publish('combat:primaryAttack', netEntity, targetVector, entity);
                                    }
                                }
                            });
                        });

                        // entity.stream.on('combat:damageEntity', function(data) {

                        //     if (!_.isObject(data)) {
                        //         return;
                        //     }

                        //     var damageableEntities = world.getEntities('damageable');

                        //     var victimEntity = _.findWhere(damageableEntities, {
                        //         uuid: data.victimEntityUuid
                        //     });

                        //     var sourceEntity = _.findWhere(damageableEntities, {
                        //         uuid: data.sourceEntityUuid
                        //     });

                        //     if (!victimEntity) {
                        //         console.error('victim entity not found!');
                        //         return;
                        //     }

                        //     if (!sourceEntity) {
                        //         console.error('source entity not found!');
                        //         return;
                        //     }

                        //     if (sourceEntity.owner !== entity.owner &&
                        //         victimEntity.owner !== entity.owner) {
                        //         console.error('sourceEntity has wrong owner!');
                        //         return;
                        //     }

                        //     var inventorySystem = world.getSystem('inventory');
                        //     var item = inventorySystem.findItemByUuid(sourceEntity, data.itemUuid);
                        //     if (!item) {
                        //         console.error('item for damageEntity not found!');
                        //         return;
                        //     }

                        //     world.publish('combat:damageEntity', victimEntity, sourceEntity, item);

                        // });

                        entity.stream.on('fighter:die', function(data) {

                            if (!_.isObject(data)) {
                                return;
                            }

                            var damageableEntities = world.getEntities('damageable');

                            var victimEntity = _.findWhere(damageableEntities, {
                                uuid: data.victimEntityUuid
                            });

                            var sourceEntity = _.findWhere(damageableEntities, {
                                uuid: data.sourceEntityUuid
                            });

                            if (!victimEntity) {
                                console.error('victim entity not found!');
                                return;
                            }

                            if (!sourceEntity) {
                                console.error('source entity not found!');
                                return;
                            }

                            if (sourceEntity.owner !== entity.owner &&
                                victimEntity.owner !== entity.owner) {
                                console.error('sourceEntity has wrong owner!');
                                return;
                            }

                            if (sourceEntity.hasComponent('player') &&
                                victimEntity.hasComponent('player')) {
                                console.error('no PvP allowed!');
                                return;
                            }

                            world.publish('fighter:die', victimEntity, sourceEntity);

                        });

                        entity.stream.on('inventory:equipItem', function(data) {
                            if (!_.isObject(data)) {
                                return;
                            }

                            var armorList = INV_SLOTS.armorList;
                            var slotList = INV_SLOTS.slotList;
                            var invSlotList = armorList.concat(slotList);

                            if (!_.contains(invSlotList, data.sourceSlot)) {
                                $log.error('[inventory:equipItem] bad sourceSlot!');
                                return;
                            }

                            if (!_.contains(invSlotList, data.targetSlot)) {
                                $log.error('[inventory:equipItem] bad targetSlot!');
                                return;
                            }

                            var netEntities = world.getEntities('netRecv');
                            var netEntity = _.findWhere(netEntities, {uuid: data.entityUuid});

                            if (!netEntity) {
                                $log.error('[inventory:equipItem] netEntity not found!');
                                return;
                            }

                            if (netEntity.owner !== entity.owner) {
                                $log.error('[inventory:equipItem] netEntity has wrong owner!');
                                return;
                            }

                            world.publish('inventory:equipItem', netEntity, data.sourceSlot, data.targetSlot);
                        });

                        entity.stream.on('inventory:useItem', function(data) {
                            if (!_.isObject(data)) {
                                return;
                            }

                            var inventorySystem = world.getSystem('inventory');
                            var netEntities = world.getEntities('netSend');
                            var netEntity = _.findWhere(netEntities, {uuid: data.entityUuid});

                            if (!netEntity) {
                                $log.error('[inventory:useItem] netEntity not found!');
                                return;
                            }

                            if (netEntity.owner !== entity.owner) {
                                $log.error('[inventory:useItem] netEntity has wrong owner!');
                                return;
                            }

                            var inventoryComponent = netEntity.getComponent('inventory');
                            if (!inventoryComponent) {
                                $log.error('[inventory:useItem] netEntity has no inventory!');
                                return;
                            }

                            var item = inventorySystem.findItemByUuid(netEntity, data.itemUuid);
                            if (!item) {
                                $log.error('[inventory:useItem] item not found!');
                                return;
                            }

                            world.publish('inventory:useItem', netEntity, item);
                        });

                        entity.stream.on('inventory:dropItem', function(data) {
                            if (!_.isObject(data)) {
                                return;
                            }

                            var inventorySystem = world.getSystem('inventory');
                            var netEntities = world.getEntities('netSend');
                            var netEntity = _.findWhere(netEntities, {uuid: data.entityUuid});

                            if (!netEntity) {
                                $log.error('[inventory:dropItem] netEntity not found!');
                                return;
                            }

                            if (netEntity.owner !== entity.owner) {
                                $log.error('[inventory:dropItem] netEntity has wrong owner!');
                                return;
                            }

                            var inventoryComponent = netEntity.getComponent('inventory');
                            if (!inventoryComponent) {
                                $log.error('[inventory:dropItem] netEntity has no inventory!');
                                return;
                            }

                            var item = inventorySystem.findItemByUuid(netEntity, data.itemUuid);
                            if (!item) {
                                $log.error('[inventory:dropItem] item not found!');
                                return;
                            }

                            world.publish('inventory:dropItem', netEntity, item);
                        });


                        entity.stream.on('pickup:entity', function(data) {
                            if (!_.isObject(data)) {
                                return;
                            }

                            var inventorySystem = world.getSystem('inventory');
                            var netEntities = world.getEntities('netSend');
                            var netEntity = _.findWhere(netEntities, {uuid: data.entityUuid});

                            var pickupEntities = world.getEntities('pickup');
                            var pickupEntity = _.findWhere(pickupEntities, {uuid: data.pickupUuid});

                            if (!netEntity) {
                                $log.error('[pickup:entity] netEntity not found!');
                                return;
                            }

                            if (netEntity.owner !== this.userId) {
                                $log.error('[pickup:entity] netEntity has wrong owner');
                                return;
                            }

                            if (!pickupEntity) {
                                $log.error('[pickup:entity] pickupEntity not found!');
                                return;
                            }

                            var pickupComponent = pickupEntity.getComponent('pickup');

                            if (pickupComponent) {
                                // pickup will check for free slots as appropriate
                                if(inventorySystem.pickupItem(netEntity, pickupComponent.item)) {
                                    world.removeEntity(pickupEntity);
                                }
                                // $log.log('picking up item ' + pickupComponent.item.name);
                            }
                        });


                    });

                    world.entityRemoved('netSend', 'player').add(function (entity) {
                        entity.stream.emit('remove', entity.uuid);
                    });

                    world.subscribe('fighter:die', Meteor.bindEnvironment(function (victim, killer) {
                        var fighterComponent = killer.getComponent('fighter');

                        if (!victim.hasComponent('player')) {
                            return;
                        }

                        var name = killer.name;

                        if (fighterComponent) {
                            name = fighterComponent.prefix + ' ' + name;
                        }

                        ChatService.announce(victim.name + ' was ' + _.sample(IB_CONSTANTS.deathWords) + ' by ' + name + '.', {
                            kill: true
                        });
                    }));

                    world.entityAdded('netSend').add(onNetSendEntityAdded.bind(this));
                    world.entityRemoved('netSend').add(onNetSendEntityRemoved.bind(this));

                },
                update: function() {

                    if (!this.updateFrequencyTimer.isExpired) {
                        return;
                    }

                    this.updateFrequencyTimer.reset();

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
                                entity.position.distanceToSquared(otherEntity.position) < 40 * 40) {
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
                                    // console.log('SEND remove to', entity.name, knownEntity.name);
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
                                    // console.log('SEND add to', entity.name, serialized.name);
                                }
                            });
                        }

                        sendComponent.__knownEntities = knownEntities;

                        if (entity.hasComponent('player')) {
                            sendComponent.__knownEntities.forEach(function (knownEntity) {
                                var packet = {};

                                if (!sendComponent._last) {
                                    sendComponent._last = {};
                                }

                                var last = sendComponent._last[knownEntity.uuid];

                                if (last) {
                                    var pos = knownEntity.position.serialize(),
                                        rot = knownEntity.rotation.serialize(),
                                        lastPos = last.pos,
                                        lastRot = last.rot;

                                    if (!arraysAreEqual(pos, lastPos) || !arraysAreEqual(rot, lastRot)) {
                                        last.pos = pos;
                                        last.rot = rot;

                                        packet[knownEntity.uuid] = last;
                                    }
                                } else {
                                    last = {
                                        pos: knownEntity.position.serialize(),
                                        rot: knownEntity.rotation.serialize()
                                    };
                                    packet[knownEntity.uuid] = last;
                                    sendComponent._last[knownEntity.uuid] = last;
                                }

                                if (Object.keys(packet).length > 0) {
                                    entity.stream.emit('transforms', packet);
                                }
                            })
                        }

                    });
                },
                _entityCAH: function(entity, componentName) {
                    // console.log('cadd', entity.name, componentName);
                    var component = entity.getComponent(componentName);

                    var sendComponent = entity.getComponent('netSend');
                    sendComponent.__knownEntities.concat([entity]).forEach(function(knownEntity) {
                        if (knownEntity.hasComponent('player')) {
                            // console.log('SEND cadd to', knownEntity.name, component.serializeNet());
                            knownEntity.stream.emit('cadd', entity.uuid, component.serializeNet());
                        }
                    });
                },
                _entityCRH: function(entity, componentName) {
                    // console.log('cremove', entity.name, componentName);
                    var component = entity.getComponent(componentName);

                    var sendComponent = entity.getComponent('netSend');
                    sendComponent.__knownEntities.concat([entity]).forEach(function(knownEntity) {
                        if (knownEntity.hasComponent('player')) {
                            // console.log('SEND cremove to', knownEntity.name, componentName);
                            knownEntity.stream.emit('cremove', entity.uuid, componentName);
                        }
                    });
                },
                updateComponent: function(entity, componentName) {
                    var component = entity.getComponent(componentName);

                    var sendComponent = entity.getComponent('netSend');
                    sendComponent.__knownEntities.concat([entity]).forEach(function(knownEntity) {
                        if (knownEntity.hasComponent('player')) {
                            knownEntity.stream.emit('cupdate', entity.uuid, component.serializeNet(), componentName);
                        }
                    });
                }
            });

            return NetworkSystem;
        }
    ]);
