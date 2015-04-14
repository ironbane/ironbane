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

            function onEntityAdded(entity) {
                var netComponent = entity.getComponent('networked');

                if (netComponent.recieve) {

                }
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

                    // this to just update transforms
                    this._stream.on('transforms', function(packet) {
                        $log.debug('[NetworkSystem : transforms]', packet);
                        // prolly need to throttle
                        $rootScope.$apply();
                    });

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
                                '/scripts/built-in/admin-controls.js',
                                '/scripts/built-in/network-send.js',
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

                    world.entityAdded('networked').add(onEntityAdded.bind(this));
                },
                update: function() {
                    var networkedEntities = this.world.getEntities('networked'),
                        packet = {};

                    networkedEntities.forEach(function(netEntity) {
                        var netComponent = netEntity.getComponent('networked');
                        if (netComponent.send) {
                            packet[netEntity.uuid] = {
                                pos: netEntity.position.serialize(),
                                rot: netEntity.position.serialize()
                            };
                        }
                    });

                    this._stream.emit('transforms', packet);
                }
            });

            return NetworkSystem;
        }
    ]);
