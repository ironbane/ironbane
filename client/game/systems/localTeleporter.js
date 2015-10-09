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
                    var sys = this;

                    sys._super(world);

                    world.entityAdded('teleportSelf').add(function(entity) {
                        var teleportComponent = entity.getComponent('teleportSelf');
                        if (teleportComponent.targetEntityUuid) {
                            var targetEntity = world.scene.getObjectByProperty('uuid', teleportComponent.targetEntityUuid);
                            if (targetEntity) {
                                entity.position.copy(targetEntity.position);
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
