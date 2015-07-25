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
                },
                update: function(dt) {
                    if ($clientSettings.get('isAdminPanelOpen')) {
                        return;
                    }

                    var input = this.world.getSystem('input');

                    var mouseHelpers = this.world.getEntities('mouseHelper');
                    var entitiesWithOctree = this.world.getEntities('octree');
                    var entitiesWithCamera = this.world.getEntities('camera');

                    mouseHelpers.forEach(function(mouseHelperEnt) {
                        var mouseHelperData = mouseHelperEnt.getComponent('mouseHelper');
                        var mesh = mouseHelperData.mesh;

                        if (entitiesWithOctree.length && entitiesWithCamera.length) {
                            var foundHitPoint = null;

                            entitiesWithOctree.forEach(function(octreeEntity) {
                                var activeCamera = entitiesWithCamera[0].getComponent('camera')._camera;
                                var octree = octreeEntity.getComponent('octree').octreeResultsNearPlayer;

                                if (activeCamera && octree) {
                                    var mouse = input.mouse.getPosition();
                                    var vector = new THREE.Vector3(mouse.x, mouse.y, 1);
                                    vector.unproject( activeCamera );

                                    ray.set(activeCamera.position, vector.sub(activeCamera.position).normalize());

                                    var intersections = ray.intersectOctreeObjects(octree);

                                    if (intersections.length) {
                                        if (!foundHitPoint ||
                                            activeCamera.position.distanceToSquared(intersections[0].point) < activeCamera.position.distanceToSquared(foundHitPoint)) {
                                            foundHitPoint = intersections[0].point;
                                        }
                                    }
                                }
                            });

                            if (foundHitPoint) {
                                mouseHelperData.target.copy(foundHitPoint);
                            }
                        }

                        mouseHelperData.mesh.position.lerp(mouseHelperData.target, dt * 20);

                        if (mouseHelperData.target.clone().sub(mouseHelperEnt.position).lengthSq() > 5 * 5) {
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
