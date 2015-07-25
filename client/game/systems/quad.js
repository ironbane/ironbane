// a "quad" is a billboard that doesn't look up
angular
    .module('game.systems.quad', [
        'ces',
        'three',
        'engine.textureLoader',
        'engine.char-builder',
        'engine.entity-cache'
    ])
    .factory('QuadSystem', [
        'System',
        'THREE',
        'TextureLoader',
        '$log',
        '$q',
        'CharBuilder',
        '$entityCache',
        function(System, THREE, TextureLoader, $log, $q, CharBuilder, $entityCache) {
            'use strict';

            var displayUVFrame = function(mesh, indexH, indexV, numberOfSpritesH, numberOfSpritesV, mirror) {

                mirror = mirror || false;

                var amountU = (1 / numberOfSpritesH);
                var amountV = (1 / numberOfSpritesV);

                var uvs1 = mesh.geometry.faceVertexUvs[0][0];
                var uvs2 = mesh.geometry.faceVertexUvs[0][1];

                if (!mirror) {
                    uvs1[0].x = amountU * indexH;
                    uvs1[0].y = 1 - (amountV * indexV);

                    uvs1[1].x = uvs1[0].x;
                    uvs1[1].y = uvs1[0].y - amountV;

                    uvs1[2].x = uvs1[0].x + amountU;
                    uvs1[2].y = uvs1[0].y;
                } else {
                    uvs1[0].x = amountU * (indexH + 1);
                    uvs1[0].y = 1 - (amountV * indexV);

                    uvs1[1].x = uvs1[0].x;
                    uvs1[1].y = uvs1[0].y - amountV;

                    uvs1[2].x = uvs1[0].x - amountU;
                    uvs1[2].y = uvs1[0].y;
                }

                uvs2[0].x = uvs1[1].x;
                uvs2[0].y = uvs1[1].y;

                uvs2[1].x = uvs1[2].x;
                uvs2[1].y = uvs1[1].y;

                uvs2[2].x = uvs1[2].x;
                uvs2[2].y = uvs1[2].y;

                mesh.geometry.uvsNeedUpdate = true;
            };

            var QuadSystem = System.extend({
                addedToWorld: function(world) {
                    var sys = this;

                    sys._super(world);

                    world.entityAdded('quad').add(function(entity) {
                        var quadData = entity.getComponent('quad'),
                            quad;

                        var planeGeo = new THREE.PlaneGeometry(1.0, 1.0, 1, 1);

                        quad = new THREE.Mesh(planeGeo, new THREE.MeshBasicMaterial());
                        quad.material.side = THREE.DoubleSide;
                        quad.geometry.dynamic = true;

                        var promise;

                        if (quadData.texture) {
                            var deferred = $q.defer();
                            deferred.resolve(quadData.texture);
                            promise = deferred.promise;
                        } else if (quadData.charBuildData) {
                            promise = CharBuilder.makeChar(quadData.charBuildData);
                        }

                        if (promise) {
                            promise.then(function(texture) {
                                return TextureLoader.load(texture)
                                    .then(function(loadedTexture) {
                                        loadedTexture.minFilter = loadedTexture.magFilter = THREE.NearestFilter;
                                        loadedTexture.wrapS = loadedTexture.wrapT = THREE.ClampToEdgeWrapping;
                                        // loadedTexture.needsUpdate = true;
                                        quad.material.map = loadedTexture;
                                        // quad.material.emissive.set('#999'); // char is always lit to some degree
                                        quad.material.needsUpdate = true;
                                        quad.geometry.buffersNeedUpdate = true;
                                        quad.geometry.uvsNeedUpdate = true;
                                        quad.material.transparent = quadData.transparent;
                                        // quad.material.transparent = false;
                                    });
                            });
                        }

                        quadData._quad = quad;
                        // It's not worth it to keep the quad as a child of the original entity,
                        // because the only thing that needs to be sync'd is the position.
                        // It's hard to get the rotations and scaling right in terms of math (atleast for me)
                        // and probably also for CPU, so we just copy the position instead
                        // and set the parent to be the same as the entity's parent (usually the scene)
                        world.scene.add(quad);
                    });

                    world.entityRemoved('quad').add(function(entity) {
                        // because it was above added to the scene, now we have to manually remove it
                        var quad = entity.getComponent('quad')._quad;
                        world.scene.remove(quad);
                    });
                },
                update: function() {
                    var world = this.world,
                        quads = world.getEntities('quad'),
                        entitiesWithCamera = this.world.getEntities('camera'),
                        activeCamera;

                    if (entitiesWithCamera.length) {
                        // HACK: this might not be the active camera someday...
                        activeCamera = entitiesWithCamera[0].getComponent('camera')._camera;
                    }

                    if (!activeCamera) {
                        //$log.warn('No camera to look at!');
                        return;
                    }

					var mainPlayer = $entityCache.get('mainPlayer');

                    quads.forEach(function(quadEnt) {
                        var quadComponent = quadEnt.getComponent('quad');
                        var quad = quadComponent._quad;
                        if (!quad) {
                            //$log.warn('quad not loaded for entity', quadEnt);
                            return;
                        }
                        quad.position.copy(quadEnt.position);

                        var camWorldPos = new THREE.Vector3();
                        camWorldPos.setFromMatrixPosition(activeCamera.matrixWorld);

                        camWorldPos.y = quad.position.y;

                        displayUVFrame(quad,
                            quadComponent.indexH,
                            quadComponent.indexV,
                            quadComponent.numberOfSpritesH,
                            quadComponent.numberOfSpritesV,
                            quadComponent.mirror);

                        quad.lookAt(camWorldPos, quad.position, quad.up);

	                    if (mainPlayer && quadEnt === mainPlayer) {
	                    	var multiCamComponent = quadEnt.getScript('/scripts/built-in/character-multicam.js');
	                    	if (multiCamComponent) {
		                    	var opac = multiCamComponent.camDistanceLimit / 2;
		                    	opac = Math.max(opac, 0.0);
		                    	opac = Math.min(opac, 1.0);
	                        	quad.material.opacity = opac;
                        	}
	                    }

                    });
                }
            });

            return QuadSystem;
        }
    ]);
