angular
    .module('game.systems.network', [
        'ces',
        'engine.entity-builder',
        'game.world-root',
        'engine.entity-cache'
    ])
    .factory('NetworkSystem', [
        'System',
        'EntityBuilder',
        '$log',
        '$rootScope',
        '$components',
        '$rootWorld',
        '$entityCache',
        function(System, EntityBuilder, $log, $rootScope, $components, $rootWorld, $entityCache) {
            'use strict';

            function arraysAreEqual(a1, a2) {
                // TODO make more robust? this is just for transforms right now
                return (a1[0] === a2[0]) && (a1[1] === a2[1]) && (a1[2] === a2[2]);
            }

            function onReceiveTransforms(packet) {

            }

            var NetworkSystem = System.extend({
                init: function(updateFrequency) {
                    this._super();

                    this.updateFrequency = updateFrequency || 0.2;
                },
                addedToWorld: function(world) {
                    this._super(world);

                    $log.debug('[NetworkSystem addedToWorld]', world.name, Session.get('activeLevel'));

                    this._stream = new Meteor.Stream(Session.get('activeLevel') + '_entities');

                    this._stream.on('transforms', onReceiveTransforms.bind(this));

                    // this for any adds (even first boot)
                    this._stream.on('add', function(entity) {
                        // ok let's see what happens when we build it
                        var builtEntity = EntityBuilder.build(entity);

                        // test if this is the "main" player so we can enhance
                        var scriptComponent = builtEntity.getComponent('script');
                        // Add all the stuff to make us a real player
                        builtEntity.addComponent($components.get('player'));
                        builtEntity.addComponent($components.get('collisionReporter'));
                        builtEntity.addComponent($components.get('light', {
                            type: 'PointLight',
                            color: 0x60511b,
                            distance: 3.5
                        }));
                        builtEntity.addComponent($components.get('health', {
                            max: 5,
                            value: 5
                        }));
                        builtEntity.addComponent($components.get('camera', {
                            aspectRatio: $rootWorld.renderer.domElement.width / $rootWorld.renderer.domElement.height
                        }));

                        if (scriptComponent) {
                            scriptComponent.scripts = scriptComponent.scripts.concat([
                                '/scripts/built-in/character-controller.js',
                                '/scripts/built-in/character-multicam.js',
                            ]);
                        }

                        $entityCache.put('mainPlayer', builtEntity);

                        world.addEntity(builtEntity);

                        $log.debug('[NetworkSystem : add]', entity, builtEntity);

                        $rootScope.$apply();
                    });

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
                },
                update: function() {
                    // for now just send transform
                    var entities = this.world.getEntities('netSend'),
                        packet = {};

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
