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

            function onEntityAdded(entity) {
                var octreeComponent = entity.getComponent('octree'),
                    meshComponent = entity.getComponent('mesh');

                octreeComponent._octree = new THREE.Octree({
                    undeferred: octreeComponent.undeferred,
                    useFaces: octreeComponent.useFaces
                });

                meshComponent._meshLoadTask.then(function(mesh) {
                    octreeComponent._octree.add(mesh);
                });

                octreeComponent.lastOctreeBuildPosition = new THREE.Vector3(0, 1000000, 0);
                octreeComponent.octreeResultsNearPlayer = null;
            }

            var OctreeSystem = System.extend({
                addedToWorld: function(world) {
                    this._super(world);

                    world.entityAdded('octree', 'mesh').add(onEntityAdded.bind(this));
                },
                update: function() {
                    var mainPlayer = $entityCache.get('mainPlayer'),
                        entitiesWithOctree = this.world.getEntities('octree');

                    entitiesWithOctree.forEach(function(entity) {
                        var octreeComponent = entity.getComponent('octree');

                        if (mainPlayer && octreeComponent._octree) {
                            if (octreeComponent.lastOctreeBuildPosition.clone().sub(mainPlayer.position).lengthSq() > 100) {
                                octreeComponent.lastOctreeBuildPosition.copy(mainPlayer.position);
                                octreeComponent.octreeResultsNearPlayer = octreeComponent._octree
                                    .search(octreeComponent.lastOctreeBuildPosition, 15, true);
                                $log.debug('rebuilt octree results');
                            }
                        }
                    });
                }
            });

            return OctreeSystem;
        }
    ]);
