angular
    .module('game.systems.localTeleporter', [
        'ces',
        'three'
    ])
    .factory('LocalTeleporterSystem', [
        'System',
        'THREE',
        function(System, THREE) {
            'use strict';

            var LocalTeleporterSystem = System.extend({
                addedToWorld: function(world) {
                    var me = this;

                    me._super(world);

                    var _positionCache = {};

                    world.entityAdded('fighter').add(function(entity) {
                        _positionCache[entity.uuid] = entity.position;
                    });

                    world.entityRemoved('fighter').add(function(entity) {
                        (function(uuid) {
                            setTimeout(function () {
                                delete _positionCache[uuid];
                            }, 10000);
                        })(entity.uuid);
                    });

                    world.entityAdded('teleportSelf').add(function(entity) {
                        var teleportComponent = entity.getComponent('teleportSelf');
                        if (teleportComponent.targetEntityUuid) {
                            if (_positionCache[teleportComponent.targetEntityUuid]) {
                                entity.position.copy(_positionCache[teleportComponent.targetEntityUuid]);
                            }
                            if (teleportComponent.offsetPosition) {
                                entity.position.add(new THREE.Vector3().copy(teleportComponent.offsetPosition));
                            }
                        }
                    });
                },
                update: function() {
                    // none
                }
            });

            return LocalTeleporterSystem;
        }
    ]);
