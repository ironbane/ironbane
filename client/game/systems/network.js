angular
    .module('game.systems.network', [
        'ces',
        'three',
        'engine.entity-builder',
        'game.world-root',
        'engine.entity-cache',
        'engine.util',
        'ammo',
        'engine.timing'
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
        '$timing',
        '$timeout',
        'IbUtils',
        function(System, EntityBuilder, $log, $rootScope, $components, $rootWorld, $entityCache, THREE, Ammo, $timing, $timeout, IbUtils) {
            'use strict';

            function arraysAreEqual(a1, a2) {
                // TODO make more robust? this is just for transforms right now
                return (a1[0] === a2[0]) && (a1[1] === a2[1]) && (a1[2] === a2[2]);
            }

            var toSimpleRotationY = function(rotation) {
                var rotVec = new THREE.Vector3(0, 0, 1);
                rotVec.applyEuler(rotation);

                var simpleRotationY = (Math.atan2(rotVec.z, rotVec.x));
                if (simpleRotationY < 0) {
                    simpleRotationY += (Math.PI * 2);
                }
                simpleRotationY = (Math.PI * 2) - simpleRotationY;

                return simpleRotationY;
            };

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

                    $log.debug('[NetworkSystem : add]', uuid);

                    // var exists = world.scene.getObjectByProperty('uuid', uuid);
                    // if (exists) {
                        // we should update the object from the server in case of like a moving platform
                        // return;
                    // }

                    // ok let's see what happens when we build it
                    var builtEntity = EntityBuilder.build(entity);

                    // test if this is the "main" player so we can enhance
                    if ($rootScope.currentUser._id === entity.owner) {
                        var scriptComponent = builtEntity.getComponent('script');
                        builtEntity.addComponent('mouseHelper');
                        builtEntity.addComponent('collisionReporter');
                        builtEntity.addComponent('light', {
                            type: 'PointLight',
                            color: 0x60511b,
                            distance: 3.5
                        });
                        builtEntity.addComponent('camera', {
                            aspectRatio: $rootWorld.renderer.domElement.width / $rootWorld.renderer.domElement.height
                        });

                        if (scriptComponent) {
                            scriptComponent.scripts = scriptComponent.scripts.concat([
                                '/scripts/built-in/character-controller.js',
                                '/scripts/built-in/character-multicam.js',
                            ]);
                        }

                        // this is pretty much the only one we want to netSend
                        builtEntity.addComponent('netSend');

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
                                type: 'capsule',
                                width: 0.5,
                                height: 1.0,
                                depth: 0.5,
                                radius: 0.5

                                // type: 'sphere',
                                // radius: 0.5
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
                    }

                    var teleportComponent = builtEntity.getComponent('teleport');
                    if (teleportComponent) {
                        if (teleportComponent.targetEntityUuid) {
                            var targetEntity = world.scene.getObjectByProperty('uuid', teleportComponent.targetEntityUuid);
                            if (targetEntity) {
                                builtEntity.position.copy(targetEntity.position);
                            }
                            if (teleportComponent.offsetPosition) {
                                builtEntity.position.add(new THREE.Vector3().copy(teleportComponent.offsetPosition));
                            }
                        }

                    }

                    world.addEntity(builtEntity);
                });
            }

            var NetworkSystem = System.extend({
                init: function(updateFrequency) {
                    this._super();

                    this.updateFrequency = updateFrequency || 0.2;

                    // instead of reacting on every event, queue up the updates for the update loop
                    this._updates = [];
                },
                addedToWorld: function(world) {
                    this._super(world);

                    var me = this;

                    world.subscribe('inventory:equipItem', function(entity, sourceSlot, targetSlot) {
                        if (entity.hasComponent('netSend') && me._stream) {
                            // TODO: UUID for items
                            me._stream.emit('inventory:equipItem', {
                                entityId: entity.uuid,
                                sourceSlot: sourceSlot,
                                targetSlot: targetSlot
                            });
                        }
                    });

                    world.subscribe('inventory:dropItem', function(entity, item) {
                        if (entity.hasComponent('netSend') && me._stream) {
                            // TODO: UUID for items
                            me._stream.emit('inventory:dropItem', {
                                entityId: entity.uuid,
                                itemUuid: item.uuid
                            });
                        }
                    });

                    world.subscribe('inventory:useItem', function(entity, item) {
                        if (entity.hasComponent('netSend') && me._stream) {
                            // TODO: UUID for items
                            me._stream.emit('inventory:useItem', {
                                entityId: entity.uuid,
                                itemUuid: item.uuid
                            });
                        }
                    });

                    world.subscribe('pickup:entity', function(entity, pickup) {
                        if (entity.hasComponent('netSend') && me._stream) {
                            me._stream.emit('pickup:entity', {
                                entityId: entity.uuid,
                                pickupId: pickup.uuid
                            });
                        }
                    });

                    world.subscribe('combat:primaryAttack', function(entity, targetVector) {
                        if (entity.hasComponent('netSend') && me._stream) {
                            me._stream.emit('combat:primaryAttack', {
                                entityId: entity.uuid,
                                targetVector: targetVector
                            });
                        }
                    });

                    world.subscribe('fighter:jump', function(entity) {
                        if (entity.hasComponent('netSend') && me._stream) {
                            me._stream.emit('fighter:jump', entity.uuid);
                        }
                    });

                    world.subscribe('combat:damageEntity', function(victimEntity, data) {
                        // We only tell the server if the event has something to do with the mainPlayer
                        // otherwise it's none of our business
                        var mainPlayer = $entityCache.get('mainPlayer');

                        if (victimEntity === mainPlayer || data.sourceEntity === mainPlayer) {
                            if (victimEntity.hasComponent('damageable') && me._stream) {
                                me._stream.emit('combat:damageEntity', {
                                    victimEntityUuid: victimEntity.uuid,
                                    sourceEntityUuid: data.sourceEntity.uuid,
                                    damage: data.damage
                                });
                            }
                        }

                        var damageableComponent = victimEntity.getComponent('damageable');
                        damageableComponent.sources.push(data);
                    });

                    // Set up streams and make sure it reruns everytime we change levels or change user
                    // $meteor.autorun is linked to $scope which we don't have here,
                    // so Meteor.autorun is the only way AFAIK

                    var streams = {};

                    Meteor.autorun(function() {

                        if (me._stream) {
                            me._stream.close();
                        }

                        if (!Meteor.user()) {
                            return;
                        }

                        var streamName = [Meteor.userId(), 'entities'].join('_');

                        if (streams[streamName]) {
                            me._stream = streams[streamName]
                        }
                        else {
                            me._stream = new Meteor.Stream(streamName);
                            streams[streamName] = me._stream;
                        }

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

                                        var targetPosition = (new THREE.Vector3()).fromArray(data.pos);

                                        // If the distance is too far away, just teleport them
                                        if (entity.position.distanceToSquared(targetPosition) > 5 * 5) {
                                            entity.position.copy(targetPosition);
                                            rigidbodySystem.syncBody(entity);
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

                        me._stream.on('remove', function(entityId) {
                            $log.debug('[NetworkSystem : remove]', entityId);
                            var obj = world.scene.getObjectByProperty('uuid', entityId);
                            // test if instanceof Entity?
                            if (obj) {
                                world.removeEntity(obj);
                            } else {
                                $log.debug('not found to remove...');
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


                        me._stream.on('inventory:equipItem', function(data) {
                            var inv = world.getSystem('inventory'),
                                netents = world.getEntities('netRecv'),
                                entity = _.findWhere(netents, {
                                    uuid: data.entityId
                                });

                            //$log.debug('inventory:onEquipItem', data, entity.uuid);

                            if (entity) {
                                inv.equipItem(entity, data.sourceSlot, data.targetSlot);
                            }
                        });

                        me._stream.on('inventory:snapshot', function(data) {
                            var inventorySystem = world.getSystem('inventory'),
                                netents = world.getEntities('netSend'),
                                entity = _.findWhere(netents, {
                                    uuid: data.entityId
                                });

                            if (entity) {
                                var inventoryComponent = entity.getComponent('inventory');
                                if (inventoryComponent) {
                                    console.log('inv snapshot', data.snapshot);
                                    angular.extend(inventoryComponent, data.snapshot);
                                    inventorySystem.refresh.emit(entity);
                                }
                            }
                            //$log.debug('inventory:onEquipItem', data, entity.uuid);

                        });

                        me._stream.on('inventory:onItemAdded', function(data) {
                            var inv = world.getSystem('inventory'),
                                netents = world.getEntities('netSend'),
                                entity = _.findWhere(netents, {
                                    uuid: data.entityId
                                });

                            if (entity) {
                                inv.addItem(entity, data.item, data.slot);
                            }
                        });

                        me._stream.on('inventory:onItemRemoved', function(data) {
                            var inv = world.getSystem('inventory'),
                                netents = world.getEntities('netSend'),
                                entity = _.findWhere(netents, {
                                    uuid: data.entityId
                                });

                            if (entity) {
                                var item = inv.findItemByUuid(entity, data.itemId);
                                if (item) {
                                    inv.removeItem(entity, item);
                                }
                            }
                        });

                        // this one we'll just pass through
                        me._stream.on('combat:primaryAttack', function(data) {
                            var netEnts = world.getEntities('netRecv'),
                                entity = _.findWhere(netEnts, {
                                    uuid: data.entityId
                                });

                            if (entity) {
                                world.publish('combat:primaryAttack', entity, data.targetVector);
                            }
                        });

                        me._stream.on('fighter:jump', function(uuid) {
                            var netEnts = world.getEntities('netRecv'),
                                entity = _.findWhere(netEnts, {
                                    uuid: uuid
                                });

                            if (entity) {
                                world.publish('fighter:jump', entity);
                            }
                        });

                        // this one we'll just pass through
                        me._stream.on('combat:damageEntity', function(data) {
                            var damageableEntities = world.getEntities('damageable');

                            var victimEntity = _.findWhere(damageableEntities, {
                                uuid: data.victimEntityUuid
                            });

                            var sourceEntity = _.findWhere(damageableEntities, {
                                uuid: data.sourceEntityUuid
                            });

                            var mainPlayer = $entityCache.get('mainPlayer');

                            // Server shouldn't include info if it's the mainPlayer but it does
                            // so we need to check for it here and ignore it
                            if (sourceEntity && victimEntity !== mainPlayer && sourceEntity !== mainPlayer) {
                                me.world.publish('combat:damageEntity', victimEntity, {
                                    sourceEntity: sourceEntity,
                                    type: 'damage',
                                    damage: data.damage
                                });
                            }
                        });


                    });
                },
                update: function() {
                    // for now just send transform
                    var entities = this.world.getEntities('netSend'),
                        packet = {};

                    while (this._updates.length) {
                        var apply = this._updates.pop();
                        apply();
                    }

                    // on the client, this will be low, like the main player mostly?
                    entities.forEach(function(entity) {
                        // we only want to send changed
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
                        //$log.debug('sending new transforms ', packet);
                        this._stream.emit('transforms', packet);
                    }
                }
            });

            return NetworkSystem;
        }
    ]);