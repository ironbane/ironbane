angular
    .module('systems.network', ['ces'])
    .factory('NetworkSystem', [
        'System',
        function(System) {
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
                // when a networked entity is added to the world
                // then we should send that to the clients

                // we just want to send enough of the info so that the client can build it
                // (EntityBuilder.build)
                var entityData = {
                    components: {
                        networked: {
                            recieve: true,
                            netId: entity.uuid // need the server's uuid (memory) so we know what to update later
                        }
                    }
                };

                this._stream.emit('add', entityData);
            }

            var NetworkSystem = System.extend({
                addedToWorld: function(world) {
                    this._super(world);

                    world.entityAdded('networked').add(onEntityAdded.bind(this));

                    // each world should have its own network stream
                    this._stream = new Meteor.Stream(world.name + '_entities');

                    this._stream.on('transforms', onRecieveTransforms.bind(this));
                },
                update: function() {

                }
            });

            return NetworkSystem;
        }
    ]);
