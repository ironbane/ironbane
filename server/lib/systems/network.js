angular
    .module('systems.network', ['ces'])
    .factory('NetworkSystem', [
        'System',
        '$log',
        function(System, $log) {
            'use strict';

            function onRecieveTransforms(packet) {
                var sender = this.userId,
                    world = this.world,
                    netEntities = world.getEntities('networked');

                netEntities.forEach(function(entity) {
                    var netComponent = entity.getComponent('networked');

                    if (packet[entity.uuid] && netComponent.owner === sender && netComponent.recieve) {
                        entity.position.deserialize(packet[entity.uuid].pos);
                        entity.rotation.deserialize(packet[entity.uuid].rot);
                    }
                });
            }

            function onEntityAdded(entity) {
                // not sure why but the stream isn't calling the same toJSON...
                var serialized = JSON.parse(JSON.stringify(entity));
                $log.debug('netAdd', serialized);
                // when a networked entity is added to the world
                // then we should send that to the clients

                this._stream.emit('add', serialized);
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

                    world.entityAdded('networked').add(onEntityAdded.bind(this));
                },
                update: function() {

                }
            });

            return NetworkSystem;
        }
    ]);
