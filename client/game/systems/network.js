angular
    .module('game.systems.network', [
        'ces'
    ])
    .factory('NetworkSystem', [
        'System',
        '$log',
        function(System, $log) {
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

                    this._stream = new Meteor.Stream('entities');
                },
                addedToWorld: function(world) {
                    this._super(world);

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
