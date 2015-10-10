angular
    .module('game.systems.mouseHelper', [
        'ces',
        'three',
        'engine.textureLoader',
        'game.clientSettings'
    ])
    .factory('MouseHelperSystem', [
        'System',
        'THREE',
        '$clientSettings',
        function(System, THREE, $clientSettings) {
            'use strict';

            var geometry = new THREE.SphereGeometry(0.1, 4, 4);
            var material = new THREE.MeshBasicMaterial({
                opacity: 0.8,
                transparent: true
            });

            var ray = new THREE.Raycaster();
            var projector = new THREE.Projector();

            var MouseHelperSystem = System.extend({
                addedToWorld: function(world) {
                    var sys = this;

                    sys._super(world);

                    this.world = world;

                    world.entityAdded('mouseHelper').add(function(entity) {
                        var mouseHelperData = entity.getComponent('mouseHelper');
                        mouseHelperData.mesh = new THREE.Mesh(geometry, material);
                        mouseHelperData.target = new THREE.Vector3();
                        mouseHelperData.inRange = false;
                        world.scene.add(mouseHelperData.mesh);
                    });

                    world.entityRemoved('mouseHelper').add(function(entity) {
                        var mouseHelperData = entity.getComponent('mouseHelper');
                        world.scene.remove(mouseHelperData.mesh);
                    });

                    // hacky for now
                    sys._useMouse = true; // default to mouse, it *is* a mouseHelper after all
                    var input = world.getSystem('input');
                    if (input) {
                        input.gamepadMgr.pad1.on('gamepad:axischange', function() {
                            sys._useMouse = false;
                        });
                        input.gamepadMgr.pad1.on('gamepad:disconnect', function() {
                            sys._useMouse = true;
                        });
                    }
                    sys._mousePos = input.mouse.getPosition();
                },
                update: function(dt) {
                    if ($clientSettings.get('isAdminPanelOpen')) {
                        return;
                    }

                    var sys = this;

                    var input = this.world.getSystem('input');

                    var mouseHelpers = this.world.getEntities('mouseHelper');
                    var entitiesWithCamera = this.world.getEntities('camera');

                    // update the stored mouse pos (so I can fake it with the gamepad)
                    if (this._useMouse) {
                        this._mousePos = input.mouse.getPosition();
                    } else {
                        this._mousePos.x += input.gamepadMgr.pad1.axis(2) * dt;
                        this._mousePos.y += input.gamepadMgr.pad1.axis(3) * dt * -1;
                    }

                    mouseHelpers.forEach(function(mouseHelperEnt) {
                        var mouseHelperData = mouseHelperEnt.getComponent('mouseHelper');
                        var mesh = mouseHelperData.mesh;

                        if (entitiesWithCamera.length) {
                            var foundHitPoint = null;
                            var activeCamera = entitiesWithCamera[0].getComponent('camera')._camera;

                            if (activeCamera) {
                                //var mouse = input.mouse.getPosition();
                                var mouse = sys._mousePos;
                                var vector = new THREE.Vector3(mouse.x, mouse.y, 1);
                                vector.unproject( activeCamera );

                                sys.world.getSystem('rigidbody').rayCast(activeCamera.position, vector.sub(activeCamera.position).normalize(), 'mouseHelper', function (intersections) {
                                    if (intersections.length) {
                                        var dist = intersections[0].point.clone().sub(activeCamera.position).lengthSq();
                                        if (dist > 1.0) {
                                            if (!foundHitPoint ||
                                                activeCamera.position.distanceToSquared(intersections[0].point) < activeCamera.position.distanceToSquared(foundHitPoint)) {
                                                foundHitPoint = intersections[0].point;
                                            }
                                        }
                                    }
                                });
                            }

                            if (foundHitPoint) {
                                mouseHelperData.target.copy(foundHitPoint);
                            }
                        }


                        var toTarget = mouseHelperData.target.clone().sub(mouseHelperEnt.position);

                        var dot = toTarget.dot(new THREE.Vector3(0, 0, 1).applyQuaternion(mouseHelperEnt.quaternion));

                        mouseHelperData.mesh.position.lerp(mouseHelperData.target, dt * 20);

                        if (dot > 0 && false) {
                            mouseHelperData.inRange = false;
                        } else if (toTarget.lengthSq() > mouseHelperData.range * mouseHelperData.range) {
                            mouseHelperData.inRange = false;
                        } else {
                            mouseHelperData.inRange = true;
                        }

                        if (mouseHelperData.inRange) {
                            material.color.setRGB(0, 1, 0);
                        }
                        else {
                            material.color.setRGB(1, 0, 0);
                        }
                    });
                }
            });

            return MouseHelperSystem;
        }
    ]);
