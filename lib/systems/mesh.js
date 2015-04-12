// this is a shared system because both client & server need geometry
angular
    .module('systems.mesh', [
        'ces',
        'three',
        'engine.geometryCache',
        'engine.materialCache',
        'engine.textureLoader'
    ])
    .factory('MeshSystem', [
        'System',
        '$q',
        'THREE',
        '$geometryCache',
        '$materialCache',
        'TextureLoader',
        '$log',
        function(System, $q, THREE, $geometryCache, $materialCache, TextureLoader, $log) {
            'use strict';

            var geometryLoader = new THREE.GeometryLoader(),
                materialLoader = new THREE.MaterialLoader();

            function loadTexturesForMesh(materialData, mesh, sceneId) {
                var tasks = [$q.when(1)];

                var loadTexture = function(texName, material, geometry) {
                    return TextureLoader.load('scene/' + sceneId + '/' + texName + '.png')
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

                // for a face material (others?) there are multiple materials, otherwise
                // it will just be one
                if (materialData.materials && materialData.materials.length) {
                    angular.forEach(materialData.materials, function(material, index) {
                        var filename = material.name.split('.')[0];
                        tasks.push(loadTexture(filename, mesh.material.materials[index], mesh.geometry));
                    });
                } else {
                    (function() {
                        var filename = materialData.name.split('.')[0];
                        tasks.push(loadTexture(filename, mesh.material, mesh.geometry));
                    })();
                }

                return $q.all(tasks)
                    .then(function() {
                        return mesh;
                    }, function(err) {
                        return $q.reject('Error loading textures! ' + err);
                    });
            }

            function onMeshAdded(entity) {
                var meshComponent = entity.getComponent('mesh'),
                    geometryData = $geometryCache.get(meshComponent.geometry),
                    materialData = $materialCache.get(meshComponent.material),
                    geometry = geometryLoader.parse(geometryData),
                    material = materialLoader.parse(materialData),
                    promise;

                meshComponent._mesh = new THREE.Mesh(geometry, material);
                meshComponent._meshLoaded = false; // if you need to check status

                // on the client, we need to fix the textures
                if (Meteor.isClient) {
                    promise = loadTexturesForMesh(materialData, meshComponent._mesh);
                } else {
                    promise = $q.when(meshComponent._mesh);
                }

                promise.then(function(mesh) {
                    meshComponent._meshLoaded = true;
                    entity.add(mesh);
                }, function(err) {
                    $log.error('Error loading mesh! ', err);
                });
            }

            function onMeshRemoved(entity) {
                // needed?
                $log.debug('[MeshSystem] mesh removed: ', entity.name);
            }

            var MeshSystem = System.extend({
                addedToWorld: function(world) {
                    this._super(world);

                    world.entityAdded('mesh').add(onMeshAdded.bind(this));
                    world.entityRemoved('mesh').add(onMeshRemoved.bind(this));
                },
                update: function() {
                    // nothing to do for meshes
                }
            });

            return MeshSystem;
        }
    ]);
