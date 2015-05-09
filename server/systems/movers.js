angular
    .module('server.systems.movers', [
        'ces',
        'three'
    ])
    .factory('MoversSystem', [
        'System',
        'THREE',
        function(System, THREE) {
            'use strict';

            var MoversSystem = System.extend({
                update: function(dt) {
                    var movers = this.world.getEntities('mover');

                    movers.forEach(function(entity) {
                        var moveData = entity.getComponent('mover');

                        if (!moveData._currentDirection) {
                            moveData._currentDirection = 1; // -1 for backwards
                        }

                        if (moveData.path && moveData.path.length > 0) {
                            // move through a fixed path of vectors
                        } else if (moveData.pos && moveData.pos.length > 0) {
                            // move towards this position
                            if (!moveData._originalPos) {
                                moveData._originalPos = entity.position.clone();
                            }
                            if (!moveData._targetPos) {
                                moveData._targetPos = new THREE.Vector3().fromArray(moveData.pos).add(moveData._originalPos);
                            }
                            entity.position.x += (moveData.speed * moveData._currentDirection) * dt;
                            entity.position.y += (moveData.speed * moveData._currentDirection) * dt;
                            entity.position.z += (moveData.speed * moveData._currentDirection) * dt;

                            if (entity.position.x > moveData._targetPos.x) {
                                entity.position.x = moveData._targetPos.x;
                            }
                            if (entity.position.y > moveData._targetPos.y) {
                                entity.position.y = moveData._targetPos.y;
                            }
                            if (entity.position.z > moveData._targetPos.z) {
                                entity.position.z = moveData._targetPos.z;
                            }

                            // TODO: cycle, and actually do this the right way using distance and crap cuz this is shit
                            if (entity.position.equals(moveData._targetPos)) {
                                if (moveData.cyclic && moveData.loop) {
                                    moveData._currentDirection *= -1;
                                    if (moveData._currentDirection === -1) {
                                        moveData._targetPos = moveData._originalPos.clone();
                                    } else {
                                        moveData._targetPos = new THREE.Vector3().fromArray(moveData.pos).add(moveData._originalPos);
                                    }
                                } else if (moveData.loop) {
                                    // teleport to start
                                    entity.position = moveData._originalPos.clone();
                                }
                            }
                        }
                    });
                }
            });

            return MoversSystem;
        }
    ]);
