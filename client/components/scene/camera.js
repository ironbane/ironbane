angular.module('components.scene.camera', ['ces', 'three'])
    .config(function ($componentsProvider) {
        'use strict';

        $componentsProvider.addComponentData({
            'camera': {
                aspectRatio: 16 / 9,
                nearClip: 0.1,
                farClip: 1000,
                fov: 45,
                projection: 'perspective',
                priority: 0,
                top: 0,
                left: 0,
                right: 1,
                bottom: 1
            }
        });
    })
    .factory('CameraSystem', function (System, THREE) {
        'use strict';

        var CameraSystem = System.extend({
            addedToWorld: function (world) {
                var sys = this;

                sys._super(world);

                world.entityAdded('camera').add(function (entity) {
                    var camData = entity.getComponent('camera'),
                        cam;

                    if(camData.projection === 'perspective') {
                        cam = new THREE.PerspectiveCamera(camData.fov, camData.aspectRatio, camData.nearClip, camData.farClip);

                        // TODO: remove on destroy?
                        window.addEventListener('resize', function () {
                            cam.aspect = window.innerWidth / window.innerHeight;
                            cam.updateProjectionMatrix();
                        }, false );
                    } else {
                        cam = new THREE.OrthographicCamera(camData.left, camData.right, camData.top, camData.bottom, camData.nearClip, camData.farClip);
                    }

                    // track reference
                    camData.camera = cam;
                    entity.add(cam);
                });

                world.entityRemoved('camera').add(function (entity) {
                    entity.remove(entity.getComponent('camera').camera);
                });
            },
            update: function () {
                var world = this.world;
                var cameras = world.getEntities('camera');

                if (cameras.length === 0) {
                    throw new Error('Must have at least one camera in the scene to render anything!');
                }

                cameras.sort(function (a, b) {
                    if (a.getComponent('camera').priority > b.getComponent('camera').priority) {
                        return 1;
                    }

                    if (a.getComponent('camera').priority < b.getComponent('camera').priority) {
                        return -1;
                    }

                    return 0;
                });

                cameras.forEach(function (camera) {
                    world.renderer.render(world.scene, camera.getComponent('camera').camera);
                });
            }
        });

        return CameraSystem;
    });
