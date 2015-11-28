angular
    .module('game.systems.network', [
        'ces',
        'three',
        'engine.entity-builder',
        'game.world-root',
        'engine.entity-cache',
        'engine.util',
        'ammo',
        'engine.timing',
        'game.ui.chat.chatService'
    ])
    .factory('NetworkSystem', [
        'System',
        'EntityBuilder',
        '$log',
        '$rootScope',
        '$components',
        '$rootWorld',
        '$entityCache',
        'THREE',
        'Ammo',
        'Timer',
        '$timeout',
        'IbUtils',
        'ChatService',
        function(System, EntityBuilder, $log, $rootScope, $components, $rootWorld, $entityCache, THREE, Ammo, Timer, $timeout, IbUtils, ChatService) {
            'use strict';

            function arraysAreEqual(a1, a2) {
                // TODO make more robust? this is just for transforms right now
                return (a1[0] === a2[0]) && (a1[1] === a2[1]) && (a1[2] === a2[2]);
            }

            function onStreamAdd(packet) {
                var me = this;
                $rootWorld.getLoadPromise().then(function() {
                    $timeout(function() {
                        handleAddPacket.bind(me)(packet);
                    });
                });
            };

            function handleAddPacket(packet) {
                var world = this.world;

                angular.forEach(packet, function(entity, uuid) {

                    // console.debug('[NetworkSystem : add]', entity, uuid);

                    var exists = world.scene.getObjectByProperty('uuid', uuid);
                    if (exists) {
                        world.removeEntity(exists);
                    }

                    // ok let's see what happens when we build it
                    var builtEntity = EntityBuilder.build(entity);

                    // test if this is the "main" player so we can enhance
                    if ($rootScope.currentUser._id === entity.owner) {

                        // Remove all existing entities that were sent using streams
                        var entities = world.getEntities('netRecv').concat(world.getEntities('netSend'));
                        entities.forEach(function(entity) {
                            world.removeEntity(entity);
                        });

                        var scriptComponent = builtEntity.getComponent('script');
                        builtEntity.addComponent('mouseHelper');
                        builtEntity.addComponent('collisionReporter');
                        builtEntity.addComponent('light', {
                            type: 'PointLight',
                            color: 0x60511b,
                            distance: 3.5
                        });

                        if (scriptComponent) {
                            scriptComponent.scripts = scriptComponent.scripts.concat([
                                '/scripts/built-in/character-controller.js'
                            ]);
                        }

                        // this is pretty much the only on Ge we want to netSend
                        builtEntity.addComponent('netSend');

                        var mainPlayer = $entityCache.get('mainPlayer');
                        if (mainPlayer) {
                            delete $rootScope.isTransitioning;
                        }

                        $entityCache.put('mainPlayer', builtEntity);

                        // needed somewhere on the scope for the UI, prolly doesn't *need* to be root
                        $rootScope.mainPlayer = builtEntity;
                    } else {
                        // other stuff we should recv
                        builtEntity.addComponent('netRecv');
                    }

                    if (builtEntity.hasComponent('player')) {
                        builtEntity.addComponent('rigidBody', {
                            shape: {
                                // type: 'capsule',
                                // width: 0.5,
                                // height: 1.0,
                                // depth: 0.5,
                                // radius: 0.5

                                type: 'sphere',
                                radius: 0.5
                            },
                            mass: 1,
                            friction: 0.0,
                            restitution: 0,
                            allowSleep: false,
                            lock: {
                                position: {
                                    x: false,
                                    y: false,
                                    z: false
                                },
                                rotation: {
                                    x: true,
                                    y: true,
                                    z: true
                                }
                            },
                            group: 'otherPlayers',
                            collidesWith: ['level', 'npcs']
                        });

                        if ($rootScope.currentUser._id !== entity.owner) {
                            builtEntity.addComponent('localState', {
                                state: 'goToPosition',
                                config: {
                                    targetPosition: builtEntity.position
                                }
                            });
                        }
                    }

                    $rootWorld.load(builtEntity.level).then(function() {
                        world.addEntity(builtEntity);
                    });
                });
            }

            var NetworkSystem = System.extend({
                init: function() {
                    this._super();

                    this.updateFrequencyTimer = new Timer(0.5);
                },
                addedToWorld: function(world) {
                    this._super(world);

                    var me = this;

                    world.subscribe('inventory:equipItem', function(entity, sourceSlot, targetSlot) {
                        if (entity.hasComponent('netSend')) {
                            // TODO: UUID for items
                            me._stream.emit('inventory:equipItem', {
                                entityUuid: entity.uuid,
                                sourceSlot: sourceSlot,
                                targetSlot: targetSlot
                            });
                        }
                    });

                    world.subscribe('inventory:dropItem', function(entity, item) {
                        if (entity.hasComponent('netSend')) {
                            // TODO: UUID for items
                            me._stream.emit('inventory:dropItem', {
                                entityUuid: entity.uuid,
                                itemUuid: item.uuid
                            });
                        }
                    });

                    world.subscribe('inventory:useItem', function(entity, item) {
                        if (entity.hasComponent('netSend')) {
                            // TODO: UUID for items
                            me._stream.emit('inventory:useItem', {
                                entityUuid: entity.uuid,
                                itemUuid: item.uuid
                            });
                        }
                    });

                    world.subscribe('pickup:entity', function(entity, pickup) {
                        if (entity.hasComponent('netSend')) {
                            me._stream.emit('pickup:entity', {
                                entityUuid: entity.uuid,
                                pickupUuid: pickup.uuid
                            });
                        }
                    });

                    world.subscribe('combat:primaryAttack', function(entity, targetVector) {
                        if (entity.hasComponent('netSend')) {
                            me._stream.emit('combat:primaryAttack', {
                                entityUuid: entity.uuid,
                                targetVector: targetVector.serialize()
                            });
                        }
                    });

                    world.subscribe('fighter:jump', function(entity) {
                        if (entity.hasComponent('netSend')) {
                            me._stream.emit('fighter:jump', {
                                entityUuid: entity.uuid
                            });
                        }
                    });

                    world.subscribe('fighter:die', function(victimEntity, sourceEntity) {
                        if (victimEntity.hasComponent('netSend') || sourceEntity.hasComponent('netSend')) {
                            me._stream.emit('fighter:die', {
                                victimEntityUuid: victimEntity.uuid,
                                sourceEntityUuid: sourceEntity.uuid
                            });
                        }
                    });

                    // world.subscribe('combat:damageEntity', function(victimEntity, sourceEntity, item) {
                    //     // We only tell the server if the event has something to do with our local client
                    //     // otherwise it's none of our business
                    //     if (victimEntity.hasComponent('netSend') || sourceEntity.hasComponent('netSend')) {
                    //         me._stream.emit('combat:damageEntity', {
                    //             victimEntityUuid: victimEntity.uuid,
                    //             sourceEntityUuid: sourceEntity.uuid,
                    //             itemUuid: item.uuid
                    //         });
                    //     }
                    // });

                    // world.subscribe('combat:die', function(victimEntity, sourceEntity, item) {
                    //     // We only tell the server if the event has something to do with our local client
                    //     // otherwise it's none of our business
                    //     if (victimEntity.hasComponent('netSend') || sourceEntity.hasComponent('netSend')) {
                    //         me._stream.emit('combat:die', {
                    //             victimEntityUuid: victimEntity.uuid,
                    //             sourceEntityUuid: sourceEntity.uuid
                    //         });
                    //     }
                    // });

                    // Set up streams and make sure it reruns everytime we change levels or change user
                    // $meteor.autorun is linked to $scope which we don't have here,
                    // so Meteor.autorun is the only way AFAIK
                    Meteor.autorun(function () {
                        var status = Meteor.status();

                        if (!status.connected) {
                            // Remove all existing entities that were sent using streams
                            var entities = world.getEntities('netRecv').concat(world.getEntities('netSend'));
                            entities.forEach(function(entity) {
                                world.removeEntity(entity);
                            });
                        }
                    })

                    Meteor.autorun(function() {

                        if (!Meteor.user()) {
                            return;
                        }

                        var streamName = IbUtils.shortMD5(Meteor.userId());

                        me._stream = new Meteor.Stream(streamName);
                        me._stream.resetListeners();

                        me._stream.on('transforms', function (packet) {
                            var netEntities = world.getEntities('netRecv');

                            // TODO: might be better instead to just find them by ID? not sure which search is faster
                            // (and then test they have the netRecv component)
                            netEntities.forEach(function(entity) {
                                if (packet[entity.uuid]) {
                                    var data = packet[entity.uuid];
                                    if (entity.hasComponent('player')) {
                                        if (entity.hasComponent('localState')) {
                                            entity.removeComponent('localState');
                                        }

                                        var rigidbodySystem = world.getSystem('rigidbody');

                                        var targetPosition = new THREE.Vector3().fromArray(data.pos);

                                        // If the distance is too far away, just teleport them
                                        if (entity.position.distanceToSquared(targetPosition) > 5 * 5) {
                                            entity.position.copy(targetPosition);
                                            rigidbodySystem.syncBody(entity);
                                        }

                                        if (data.rot) {
                                            var targetRotation = new THREE.Euler().fromArray(data.rot);
                                            entity.rotation.copy(targetRotation);
                                        }

                                        entity.addComponent($components.get('localState', {
                                            state: 'goToPosition',
                                            config: {
                                                targetPosition: targetPosition
                                            }
                                        }));
                                    } else {
                                        // We're dealing with an NPC. States will be added/removed using
                                        // component add/remove handlers (see cadd/remove below)
                                    }
                                }
                            });
                        });

                        // this for any adds (even first boot)
                        me._stream.on('add', onStreamAdd.bind(me));

                        me._stream.on('remove', function(entityUuid) {
                            // $log.debug('[NetworkSystem : remove]', entityUuid);
                            var obj = world.scene.getObjectByProperty('uuid', entityUuid);
                            // test if instanceof Entity?
                            if (obj) {
                                world.removeEntity(obj);

                                if (obj === $entityCache.get('mainPlayer')) {
                                    $rootScope.isTransitioning = true;
                                }
                            } else {
                                // this is prolly OK, we removed it on the client first for perf
                                //console.debug('not found to remove...');
                            }

                            $rootScope.$apply();
                        });


                        me._stream.on('cadd', function (uuid, component) {
                            // console.log('cadd', component);
                            var entity = world.scene.getObjectByProperty('uuid', uuid);
                            if (entity) {
                                entity.addComponent(component);
                            }
                        });

                        me._stream.on('cremove', function (uuid, componentName) {
                            // console.log('cremove', componentName);
                            var entity = world.scene.getObjectByProperty('uuid', uuid);
                            if (entity) {
                                entity.removeComponent(componentName);
                            }
                        });



                        // me._stream.on('inventory:snapshot', function(data) {
                        //     var inventorySystem = world.getSystem('inventory'),
                        //         netents = world.getEntities('netSend'),
                        //         entity = _.findWhere(netents, {
                        //             uuid: data.entityUuid
                        //         });

                        //     if (entity) {
                        //         var inventoryComponent = entity.getComponent('inventory');
                        //         if (inventoryComponent) {
                        //             console.log('inv snapshot', data.snapshot);
                        //             angular.extend(inventoryComponent, data.snapshot);
                        //             inventorySystem.refresh.emit(entity);
                        //         }
                        //     }
                        //     //$log.debug('inventory:onEquipItem', data, entity.uuid);
                        // });

                        me._stream.on('inventory:onPickupGold', function(data) {
                            var inv = world.getSystem('inventory'),
                                netents = world.getEntities('netSend'),
                                entity = _.findWhere(netents, {
                                    uuid: data.entityUuid
                                });

                            if (entity) {
                                inv.pickupItem(entity, data.item);
                            }
                        });

                        me._stream.on('inventory:onItemAdded', function(data) {
                            var inv = world.getSystem('inventory'),
                                netents = world.getEntities('netSend'),
                                entity = _.findWhere(netents, {
                                    uuid: data.entityUuid
                                });

                            if (entity) {
                                inv.addItem(entity, data.item, data.slot);
                            }
                        });

                        me._stream.on('inventory:onItemRemoved', function(data) {
                            var inv = world.getSystem('inventory'),
                                netents = world.getEntities('netSend'),
                                entity = _.findWhere(netents, {
                                    uuid: data.entityUuid
                                });

                            if (entity) {
                                var item = inv.findItemByUuid(entity, data.itemUuid);
                                if (item) {
                                    inv.removeItem(entity, item);
                                }
                            }
                        });

                        me._stream.on('combat:primaryAttack', function(data) {
                            var netEnts = world.getEntities('netRecv'),
                                entity = _.findWhere(netEnts, {
                                    uuid: data.entityUuid
                                });

                            if (entity) {
                                world.publish('combat:primaryAttack', entity, new THREE.Vector3().fromArray(data.targetVector));
                            }
                        });

                        me._stream.on('fighter:jump', function(data) {
                            var netEnts = world.getEntities('netRecv'),
                                entity = _.findWhere(netEnts, {
                                    uuid: data.entityUuid
                                });

                            if (entity) {
                                world.publish('fighter:jump', entity);
                            }
                        });

                        me._stream.on('fighter:updateStats', function(data) {
                            var netEnts = world.getEntities('netRecv').concat(world.getEntities('netSend')),
                                entity = _.findWhere(netEnts, {
                                    uuid: data.entityUuid
                                });

                            if (entity) {
                                var healthComponent = entity.getComponent('health');
                                var armorComponent = entity.getComponent('armor');

                                if (healthComponent && !_.isUndefined(data.health)) {
                                    healthComponent.value = data.health;
                                }

                                if (armorComponent && !_.isUndefined(data.armor)) {
                                    armorComponent.value = data.armor;
                                }

                                // if (healthComponent && healthComponent.value <= 0) {
                                //     me.world.publish('fighter:die', entity);
                                // }
                            }
                        });

                        // me._stream.on('combat:damageEntity', function(data) {
                        //     var damageableEntities = world.getEntities('damageable');
                        //     var victimEntity = _.findWhere(damageableEntities, {
                        //         uuid: data.victimEntityUuid
                        //     });
                        //     var sourceEntity = _.findWhere(damageableEntities, {
                        //         uuid: data.sourceEntityUuid
                        //     });
                        //     if (sourceEntity) {
                        //         var inventorySystem = world.getSystem('inventory');
                        //         var item = inventorySystem.findItemByUuid(sourceEntity, data.itemUuid);
                        //         if (item) {
                        //             me.world.publish('combat:damageEntity', victimEntity, sourceEntity, item);
                        //         }
                        //     }
                        // });

                        me._stream.on('fighter:die', function(data) {
                            var damageableEntities = world.getEntities('damageable');

                            var victimEntity = _.findWhere(damageableEntities, {
                                uuid: data.victimEntityUuid
                            });

                            var sourceEntity = _.findWhere(damageableEntities, {
                                uuid: data.sourceEntityUuid
                            });

                            if (sourceEntity) {
                                me.world.publish('fighter:die', victimEntity, sourceEntity);
                            }
                        });

                        me._stream.on('inventory:equipItem', function(data) {
                            var inv = world.getSystem('inventory'),
                                netents = world.getEntities('netRecv'),
                                entity = _.findWhere(netents, {
                                    uuid: data.entityUuid
                                });

                            if (entity) {
                                me.world.publish('inventory:equipItem', entity, data.sourceSlot, data.targetSlot);
                            }
                        });


                    });
                },
                update: function() {

                    if (!this.updateFrequencyTimer.isExpired) {
                        return;
                    }

                    this.updateFrequencyTimer.reset();

                    // for now just send transform
                    var entities = this.world.getEntities('netSend'),
                        packet = {};



                    // on the client, this will be low, like the main player mostly?
                    entities.forEach(function(entity) {
                        // we only want to send changed
                        var sendComponent = entity.getComponent('netSend');
                        if (sendComponent._last) {
                            var pos = entity.position.serialize(),
                                rot = IbUtils.roundNumber(entity.rotation.y, 2),
                                lastPos = sendComponent._last.pos,
                                lastRot = sendComponent._last.rot;

                            if (!arraysAreEqual(pos, lastPos) || rot !== lastRot) {
                                sendComponent._last.pos = pos;
                                sendComponent._last.rot = rot;

                                packet[entity.uuid] = sendComponent._last;
                            }
                        } else {
                            sendComponent._last = {
                                pos: entity.position.serialize(),
                                rot: IbUtils.roundNumber(entity.rotation.y, 2)
                            };
                            packet[entity.uuid] = sendComponent._last;
                        }
                    });

                    if (Object.keys(packet).length > 0) {
                        //$log.debug('sending new transforms ', packet);
                        this._stream.emit('transforms', packet);
                    }
                }
            });

            return NetworkSystem;
        }
    ]);
