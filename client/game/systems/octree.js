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
                var octreeComponent = entity.getComponent('octree');

                octreeComponent._octree = new THREE.Octree({
                    undeferred: octreeComponent.undeferred,
                    useFaces: octreeComponent.useFaces
                });

                octreeComponent._octree.add(entity);

                octreeComponent.lastOctreeBuildPosition = new THREE.Vector3(0, 1000000, 0);
                octreeComponent.octreeResultsNearPlayer = null;
            }

            var OctreeSystem = System.extend({
                addedToWorld: function(world) {
                    this._super(world);

                    world.entityAdded('octree').add(onEntityAdded.bind(this));
                },
                update: function() {
                    var mainPlayer = $entityCache.get('mainPlayer'),
                        entitiesWithOctree = this.world.getEntities('octree');

                    entitiesWithOctree.forEach(function(entity) {
                        var octreeComponent = entity.getComponent('octree')._octree;

                        if (mainPlayer && octreeComponent._octree) {
                            if (octreeComponent.lastOctreeBuildPosition.clone().sub(mainPlayer.position).lengthSq() > 100) {
                                octreeComponent.lastOctreeBuildPosition.copy(mainPlayer.position);
                                octreeComponent.octreeResultsNearPlayer = octreeComponent._octree
                                    .search(octreeComponent.lastOctreeBuildPosition, 15, true);
                                $log.log('rebuilt octree results');
                            }
                        }
                    });

                }
            });

            return OctreeSystem;
        }
    ]);
