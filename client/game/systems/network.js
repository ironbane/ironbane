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
                },
                addedToWorld: function(world) {
                    this._super(world);

                    $log.debug('[NetworkSystem addedToWorld]', world.name, Session.get('activeLevel'));

                    this._stream = new Meteor.Stream(Session.get('activeLevel') + '_entities');

                    // this to just update transforms
                    this._stream.on('transforms', function() {
                        $log.debug('recieve transforms event', arguments);
                    });
                    // this for any adds (even first boot)
                    this._stream.on('add', function(entity) {
                        $log.debug('[NetworkSystem : add]', entity);
                    });
                    // this for any removes
                    this._stream.on('remove', function() {
                        $log.debug('recieve remove event', arguments);
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
