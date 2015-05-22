// this is a shared system because both client & server need geometry
angular
    .module('systems.mesh', [
        'ces',
        'three',
        'engine.geometryCache',
        'engine.materialCache',
        'engine.textureLoader',
        'game.world-root'
    ])
    .factory('MeshSystem', [
        'System',
        '$q',
        'THREE',
        '$geometryCache',
        '$materialCache',
        'TextureLoader',
        '$log',
        '$rootWorld',
        function(System, $q, THREE, $geometryCache, $materialCache, TextureLoader, $log, $rootWorld) {
            'use strict';

            function loadTexturesForMesh(material, geometry, sceneId) {
                var tasks = [];

                var loadTexture = function(texName, material, geometry) {
                    return TextureLoader.load('scene/' + sceneId + '/' + texName + '.png')
                        .then(function(texture) {
                            //$log.debug('applying texture: ', texture, texName, material, geometry);

                            material.map = texture;
                            material.map.needsUpdate = true;
                            material.needsUpdate = true;

                            // By default, the diffuse property in Clara is set
                            // while ambient is not. To avoid confusion just use the
                            // same color. Otherwise materials will show black even when there is
                            // ambient light.
                            // BS: im not sure if this is actually needed anymore
                            material.ambient.copy(material.color);
                            material.shininess = 0;

                            // material.wireframe = true;
                            geometry.buffersNeedUpdate = true;
                            geometry.uvsNeedUpdate = true;
	                }, function(err) {
	                	console.log('Error loading texture!', err);
	                    return $q.reject('Error loading texture! ', err);
	                });
                };

                // for a face material (others?) there are multiple materials, otherwise
                // it will just be one
                if (material.materials && material.materials.length) {
                    $log.debug('loading face material: ', material);
                    material.needsUpdate = true;
                    angular.forEach(material.materials, function(material) {
                        var filename = material.name.split('.')[0];
                        //$log.debug('file: ', filename);
                        if (filename) {
                            tasks.push(loadTexture(filename, material, geometry));
                        }
                    });
                } else {
                    (function() {
                        //$log.debug('loading single material: ', material);
                        var filename = material.name.split('.')[0];
                        if (filename) {
                            tasks.push(loadTexture(filename, material, geometry));
                        }
                    })();
                }

                return $q.all(tasks);
            }

            // It's possible that we didn't load the required geometries/materials yet here
            // because the server sends us the entities before we loaded the required resources
            // Do a check here using timeout. There's probably a cleaner way to do it though.
			var checkIfGeoAndMatsAreThere = function (meshComponent) {
            	var deferred = $q.defer();

            	var doCheck = function () {
                	var geometry = $geometryCache.get(meshComponent.geometry);
            		var material = $materialCache.get(meshComponent.material);
            		if (geometry && material) {
            			deferred.resolve({
            				geometry: geometry,
            				material: material
            			});
            		}
            		else {
            			setTimeout(doCheck, 100);
            		}
            	};

        		doCheck();

            	return deferred.promise;
            };

            function onMeshAdded(entity) {
                var meshComponent = entity.getComponent('mesh'),
                    sceneId = this.world.name || this.world.scene.name,
                    promise;

                $rootWorld.renderer.shadowMapAutoUpdate = true;

				promise = checkIfGeoAndMatsAreThere(meshComponent).then(function (result) {
	                meshComponent._mesh = new THREE.Mesh(result.geometry, result.material);
	                meshComponent._meshLoaded = false; // if you need to check status

	                meshComponent._mesh.castShadow = true;
					meshComponent._mesh.receiveShadow = true;

	                if (Meteor.isClient) {
	                    return loadTexturesForMesh(result.material, result.geometry, sceneId);
	                } else {
	                    return $q.when(meshComponent._mesh);
	                }
				})

                meshComponent._meshLoadTask = promise.then(function() {
                    meshComponent._meshLoaded = true;
                    entity.add(meshComponent._mesh);

                    return meshComponent._mesh;
                }, function(err) {
                    return $q.reject('Error loading mesh! ', err);
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
