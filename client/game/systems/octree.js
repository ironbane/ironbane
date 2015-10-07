angular
    .module('game.systems.octree', [
        'three',
        'engine.entity-cache',
        'ces'
    ])
    .factory('OctreeSystem', [
        'System',
        'THREE',
        '$log',
        '$entityCache',
        function(System, THREE, $log, $entityCache) {
            'use strict';

            var OctreeSystem = System.extend({
                addedToWorld: function(world) {
                    this._super(world);

                    var me = this;

                    this.octree = new THREE.Octree({
                        undeferred: true,
                        useFaces: true
                    });

                    this.cache = {};

                    this.lastOctreeBuildPosition = new THREE.Vector3(0, 1000000, 0);
                    this.octreeResultsNearPlayer = null;

                    world.entityAdded('octree', 'mesh').add(function (entity) {
                        var meshComponent = entity.getComponent('mesh');

                        meshComponent._meshLoadTask.then(function(mesh) {
                            // me.octree.add(mesh);
                        });
                    });

                    world.entityRemoved('octree', 'mesh').add(function (entity) {
                        var meshComponent = entity.getComponent('mesh');

                        meshComponent._meshLoadTask.then(function(mesh) {
                            // me.octree.remove(mesh);
                        });
                    });

                },
                rayCast: function (pos, dir, name, fn) {
                    if (this.cache[name]) {
                        return fn(this.cache[name]);
                    }
                    if (this.octree) {
                        var ray = new THREE.Raycaster(pos, dir);

                        var intersections = ray.intersectOctreeObjects(this.octreeResultsNearPlayer);

                        this.cache[name] = intersections;

                        fn(intersections);
                    }
                },
                update: function() {
                    var mainPlayer = $entityCache.get('mainPlayer');

                    this.cache = {};

                    if (mainPlayer) {
                        if (!this.lastOctreeBuildPosition.inRangeOf(mainPlayer.position, 10)) {
                            this.lastOctreeBuildPosition.copy(mainPlayer.position);
                            this.octreeResultsNearPlayer = this.octree
                                .search(this.lastOctreeBuildPosition, 30, true);
                            // console.log('rebuilt octree results');
                        }
                    }
                }
            });

            return OctreeSystem;
        }
    ]);
