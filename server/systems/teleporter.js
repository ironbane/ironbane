angular
    .module('systems.teleporter', [
        'engine.entity-builder',
        'ces.entityProcessingSystem',
        'server.services.activeWorlds',
        'engine.util',
        'three'
    ])
    .factory('TeleporterSystem', ["EntityProcessingSystem", "EntityBuilder", "$activeWorlds", "IbUtils", "THREE", function(EntityProcessingSystem, EntityBuilder, $activeWorlds, IbUtils, THREE) {
            'use strict';

            return EntityProcessingSystem.extend({
                init: function() {
                    this._super('teleporter');
                },
                onEntityAdded: function(entity) {
                    var teleporterComponent = entity.getComponent('teleporter');

                    var isExit = teleporterComponent.type === 'exit';

                    // Find the exit
                    var findExit = function () {
                        teleporterComponent._exitEntity = null;
                        _.each($activeWorlds, function (world) {
                            var teleporterEntities = world.getEntities('teleporter');
                            teleporterEntities.forEach(function (entity) {
                                if (entity.name === teleporterComponent.nameOfTeleportExit) {
                                    teleporterComponent._exitEntity = entity;
                                }
                            });
                        });

                        if (!teleporterComponent._exitEntity) {
                            console.error('Teleporter Exit not found: ' + teleporterComponent.nameOfTeleportExit);
                        }
                    };

                    if (!isExit) {
                        setTimeout(findExit, 5000);
                    }
                },
                updateEntity: function(timing, entity) {
                    var teleporterComponent = entity.getComponent('teleporter');

                    var exitEntity = teleporterComponent._exitEntity;

                    if (!exitEntity || teleporterComponent.type === 'exit') {
                        return;
                    }

                    var playerEntities = $activeWorlds[entity.level].getEntities('player');
                    playerEntities.forEach(function (player) {
                        if (player.position.inRangeOf(entity.position, 1.0)) {
                            $activeWorlds[player.level].removeEntity(player);

                            player.level = exitEntity.level;
                            player.position.copy(exitEntity.position);

                            // exitEntity.matrixWorld.decompose( exitEntity.position, exitEntity.quaternion, exitEntity.scale );
                            // console.log(exitEntity.matrixWorld, exitEntity.matrix);

                            var forward = new THREE.Vector3(0, 0, 1).applyQuaternion(exitEntity.quaternion);
                            // console.log(forward);
                            player.rotation.y = IbUtils.vecToEuler(forward) - Math.PI / 2;
                            // console.log(player.rotation);

                            setTimeout(function () {
                                $activeWorlds[exitEntity.level].addEntity(player);
                            }, 1000);
                        }
                    });
                }
            });
        }]
    );
