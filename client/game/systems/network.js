angular
    .module('game.systems.network', [
        'ces',
        'three',
        'engine.entity-builder',
        'game.world-root',
        'engine.entity-cache',
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
        function(System, EntityBuilder, $log, $rootScope, $components, $rootWorld, $entityCache, THREE, Ammo, $timing) {
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

            function onReceiveTransforms(packet) {
                var netEntities = this.world.getEntities('netRecv'),
                    system = this;

                // TODO: might be better instead to just find them by ID? not sure which search is faster
                // (and then test they have the netRecv component)
                netEntities.forEach(function(entity) {
                    if (packet[entity.uuid]) {
                        var updateApplicator = (function(entity, data) {
                            return function() {
                                //$log.debug('entity: ', entity.name, entity.uuid, ' transform update');
                                entity.position.deserialize(data.pos);
                                entity.rotation.deserialize(data.rot);

                                if (entity.hasComponent('rigidBody')) {
                                    system.world.getSystem('rigidbody').syncBody(entity);
                                }
                            };
                        })(entity, packet[entity.uuid]);
                        system._updates.push(updateApplicator);
                        //$log.debug('entity: ', entity.name, entity.uuid, ' tranform update');
                        //entity.position.deserialize(packet[entity.uuid].pos);
                        //entity.rotation.deserialize(packet[entity.uuid].rot);
                    }
                });
            }

            function onStreamAdd(packet) {
                var world = this.world;

                angular.forEach(packet, function(entity, uuid) {
                    var exists = world.scene.getObjectByProperty('uuid', uuid);
                    if (exists) {
                        $log.debug('object already exists, prolly a json loaded object', exists, entity);
                        // we should update the object from the server in case of like a moving platform
                        exists.position.deserialize(entity.position);
                        exists.rotation.deserialize(entity.rotation);
                        return;
                    }

                    // ok let's see what happens when we build it
                    var builtEntity = EntityBuilder.build(entity);

                    // test if this is the "main" player so we can enhance
                    if ($rootScope.currentUser._id === entity.owner) {
                        var scriptComponent = builtEntity.getComponent('script');
                        // Add all the stuff to make us a real player
                        builtEntity.addComponent($components.get('player'));
                        builtEntity.addComponent($components.get('collisionReporter'));
                        builtEntity.addComponent($components.get('light', {
                            type: 'PointLight',
                            color: 0x60511b,
                            distance: 3.5
                        }));
                        builtEntity.addComponent($components.get('camera', {
                            aspectRatio: $rootWorld.renderer.domElement.width / $rootWorld.renderer.domElement.height
                        }));
                        builtEntity.addComponent($components.get('rigidBody', {
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
                            }
                        }));

                        if (scriptComponent) {
                            scriptComponent.scripts = scriptComponent.scripts.concat([
                                '/scripts/built-in/character-controller.js',
                                '/scripts/built-in/character-multicam.js',
                            ]);
                        }

                        // this is pretty much the only one we want to netSend
                        builtEntity.addComponent($components.get('netSend'));

                        $entityCache.put('mainPlayer', builtEntity);
                        // needed somewhere on the scope for the UI, prolly doesn't *need* to be root
                        $rootScope.mainPlayer = builtEntity;
                    } else {
                        // other stuff we should recv
                        builtEntity.addComponent($components.get('netRecv'));
                    }

                    world.addEntity(builtEntity);

                    $log.debug('[NetworkSystem : add]', entity, builtEntity);
                });

                $rootScope.$apply();
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

                    var activeLevel = Session.get('activeLevel');

                    $log.debug('[NetworkSystem addedToWorld]', world.name, activeLevel);

                    this._stream = new Meteor.Stream(activeLevel + '_entities');

                    this._stream.on('transforms', onReceiveTransforms.bind(this));

                    // this for any adds (even first boot)
                    this._stream.on('add', onStreamAdd.bind(this));

                    this._stream.on('remove', function(entityId) {
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

                    // as we are added to the client's world, it'll even be main menu time, we want to ask for the current state of things
                    this._stream.emit('getState');

                    // we also get a private user stream
                    var userStream = [Meteor.userId(), activeLevel, 'entities'].join('_');
                    $log.debug('userStream', userStream);
                    this._userStream = new Meteor.Stream(userStream);
                    this._userStream.on('add', onStreamAdd.bind(this));
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
                        this._stream.emit('transforms', packet);
                    }
                }
            });

            return NetworkSystem;
        }
    ]);
