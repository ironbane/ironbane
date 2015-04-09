angular
    .module('game.systems.scene', [
        'three',
        'engine.entity-cache',
        'ces',
        'engine.texture-loader'
    ])
    .factory('SceneSystem', [
        'System',
        'THREE',
        '$http',
        'TextureLoader',
        '$log',
        '$q',
        '$entityCache',
        function(System, THREE, $http, TextureLoader, $log, $q, $entityCache) {
            'use strict';

            var SceneSystem = System.extend({
                addedToWorld: function(world) {
                    var sys = this;

                    sys._super(world);

                    world.entityAdded('scene').add(function(entity) {
                        sys.onEntityAdded(entity);
                    });

                    this.world = world;

                },
                update: function() {

                    var mainPlayer = $entityCache.get('mainPlayer');

                    // Kind of weird...we'll only have one scene?
                    var scenes = this.world.getEntities('scene');

                    scenes.forEach(function(scene) {
                        if (mainPlayer && scene.octree && scene.lastOctreeBuildPosition.clone().sub(mainPlayer.position).lengthSq() > 100) {
                            scene.lastOctreeBuildPosition.copy(mainPlayer.position);
                            scene.octreeResultsNearPlayer = scene.octree
                                .search(scene.lastOctreeBuildPosition, 15, true);
                            console.log('rebuilt octree results');
                        }
                    });

                },
                onEntityAdded: function(entity) {
                    var component = entity.getComponent('scene');

                    // these are clara.io exports
                    var loader = new THREE.ObjectLoader();

                    var meshTask;

                    // Ravenwood is huge, zip it up!
                    // meshTask = $http.get('scene/' + component.id + '/ib-world.zip', {
                    //         responseType: 'arraybuffer'
                    //     })
                    //     .then(function (response) {
                    //         var zip = new JSZip(response.data);
                    //         var worldData = JSON.parse(zip.file('ib-world.json').asText());
                    //         return worldData;
                    //     }, function (err) {
                    //         // likely we don't have a zip file... try raw
                    //         return $http.get('scene/' + component.id + '/ib-world.json')
                    //             .then(function (response) {
                    //                 return response.data;
                    //             }, $q.reject); // TODO: handle errors here
                    //     })
                    meshTask = $http.get('scene/' + component.id + '/ib-world.json')
                        .then(function(response) {
                            return response.data;
                        }, $q.reject)
                        .then(function(data) {
                            // THREE does not store material names/metadata when it recreates the materials
                            // so we need to store them here and then load the material maps ourselves

                            component.scene = loader.parse(data);

                            var originalMats = data.materials[0].materials;
                            var loadTexture = function(texName, material, geometry) {
                                return TextureLoader.load('scene/' + component.id + '/' + texName + '.png')
                                    .then(function(texture) {
                                        material.map = texture;
                                        material.needsUpdate = true;

                                        // By default, the diffuse property in Clara is set
                                        // while ambient is not. To avoid confusion just use the
                                        // same color. Otherwise materials will show black even when there is
                                        // ambient light.
                                        material.ambient.copy(material.color);

                                        // material.wireframe = true;
                                        geometry.buffersNeedUpdate = true;
                                        geometry.uvsNeedUpdate = true;
                                    });
                            };

                            for (var i = 0; i < originalMats.length; i++) {
                                if (originalMats[i].name) {
                                    var texName = originalMats[i].name.split('.')[0];
                                    loadTexture(texName, component.scene.material.materials[i], component.scene.geometry);

                                }
                            }

                            // Attach an octree for easy raycasting
                            entity.octree = new THREE.Octree({
                                undeferred: true,
                                useFaces: true
                            });
                            entity.octree.add(component.scene);

                            entity.lastOctreeBuildPosition = new THREE.Vector3(0, 1000000, 0);
                            entity.octreeResultsNearPlayer = null;

                            component.scene.material.needsUpdate = true;

                            entity.scene = component.scene;
                            entity.add(component.scene);
                        }, $q.reject);

                    // Link the promises to the component so we can
                    // wait for the mesh to load in other components
                    component.meshTask = meshTask;
                },
                onEntityRemoved: function(entity) {
                    // TODO
                }
            });

            return SceneSystem;
        }
    ]);
