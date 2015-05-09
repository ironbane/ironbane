angular
    .module('server.systems.movers', [
        'ces',
        'three'
    ])
    .factory('MoversSystem', [
        '$log',
        'System',
        'THREE',
        function($log, System, THREE) {
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

                            var direction;
                            if (moveData._currentDirection === 1) {
                                direction = moveData._targetPos.clone().sub(entity.position).normalize();
                            } else {
                                direction = moveData._originalPos.clone().sub(entity.position).normalize();
                            }
                            entity.position.add(direction.multiplyScalar(moveData.speed * dt));

                            if (moveData._currentDirection === 1) {
                                if (entity.position.distanceTo(moveData._targetPos) < (moveData.speed * dt * 2)) {
                                    moveData._currentDirection = -1;
                                }
                            } else {
                                //$log.debug('dist to original: ', entity.position.distanceTo(moveData._originalPos), ' : ', (moveData.speed * dt * 4));
                                if (entity.position.distanceTo(moveData._originalPos) < (moveData.speed * dt * 2)) {
                                    moveData._currentDirection = 1;
                                }
                            }
                        }
                    });
                }
            });

            return MoversSystem;
        }
    ]);
