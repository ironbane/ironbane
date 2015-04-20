angular
    .module('systems.network', ['ces'])
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
                    if (packet[entity.uuid] && netComponent.owner === sender) {
                        entity.position.deserialize(packet[entity.uuid].pos);
                        entity.rotation.deserialize(packet[entity.uuid].rot);
                    }
                });
            }

            function onNetSendEntityAdded(entity) {
                // not sure why but the stream isn't calling the same toJSON...
                var serialized = JSON.parse(JSON.stringify(entity));
                //$log.debug('netAdd', serialized);
                // when a networked entity is added to the world
                // then we should send that to the clients

                this._stream.emit('add', serialized);
            }

            function onNetSendEntityRemoved(entity) {
                // since we're syncing up the server's uuid, just send that
                this._stream.emit('remove', entity.uuid);
            }

            var NetworkSystem = System.extend({
                addedToWorld: function(world) {
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

                    world.entityAdded('netSend').add(onNetSendEntityAdded.bind(this));
                    world.entityRemoved('netSend').add(onNetSendEntityRemoved.bind(this));
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
                }
            });

            return NetworkSystem;
        }
    ]);
