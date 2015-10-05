angular
    .module('game.systems.camera', [
        'ces',
        'three'
    ])
    .factory('CameraSystem', [
        'System',
        'THREE',
        function(System, THREE) {
            'use strict';

            class CameraSystem {
                constructor() {
                    this.world = null;
                }

                addedToWorld(world) {
                    this.world = world;

                    world.entityAdded('camera').add(function(entity) {
                        var camData = entity.getComponent('camera'),
                            cam;

                        if (camData.projection === 'perspective') {
                            cam = new THREE.PerspectiveCamera(camData.fov, camData.aspectRatio, camData.nearClip, camData.farClip);

                            // TODO: remove on destroy?
                            window.addEventListener('resize', function() {
                                cam.aspect = window.innerWidth / window.innerHeight;
                                cam.updateProjectionMatrix();
                            }, false);
                        } else {
                            cam = new THREE.OrthographicCamera(camData.left, camData.right, camData.top, camData.bottom, camData.nearClip, camData.farClip);
                        }

                        // track reference
                        camData._camera = cam;
                        entity.add(cam);
                    });

                    world.entityRemoved('camera').add(function(entity) {
                        entity.remove(entity.getComponent('camera')._camera);
                    });
                }

                removedFromWorld() {
                    this.world = null;
                }

                update() {
                    var world = this.world;
                    var cameras = world.getEntities('camera');

                    if (cameras.length === 0) {
                        return;
                    }

                    cameras.sort(function(a, b) {
                        if (a.getComponent('camera').priority > b.getComponent('camera').priority) {
                            return 1;
                        }

                        if (a.getComponent('camera').priority < b.getComponent('camera').priority) {
                            return -1;
                        }

                        return 0;
                    });

                    cameras.forEach(function(camera) {
                        world.renderer.render(world.scene, camera.getComponent('camera')._camera);
                    });
                }
            }

            return CameraSystem;
        }
    ]);
