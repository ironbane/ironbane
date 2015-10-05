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

            class QuadSystem {

                constructor() {
                    this.world = null;
                }

                addedToWorld(world) {
                    this.world = world;

                    var sys = this;

                    world.entityAdded('quad').add(function(entity) {
                        var quadData = entity.getComponent('quad'),
                            quadWrapper, quad1, quad2;

                        var planeGeo = new THREE.PlaneGeometry(quadData.width, quadData.height, 1, 1);

                        quadWrapper = new THREE.Object3D();

                        if (quadData.setVisibleOnLoad) {
                            quadWrapper.visible = false;
                        }

                        quadData.offsetPosition = new THREE.Vector3().copy(quadData.offsetPosition);

                        quad1 = new THREE.Mesh(planeGeo, new THREE.MeshBasicMaterial());
                        quad1.material.side = THREE.DoubleSide;
                        quad1.geometry.dynamic = true;

                        quadWrapper.add(quad1);

                        if (quadData.style === 'projectile') {
                            quad1.rotation.y = Math.PI / 2;
                            quad1.rotation.z = Math.PI / 4;
                            quad2 = new THREE.Mesh(quad1.geometry, quad1.material);
                            quad2.rotation.x = Math.PI / 2;
                            quad2.rotation.z -= Math.PI / 4;
                            quadWrapper.add(quad2);
                        }

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
                                        quad1.material.map = loadedTexture;
                                        // quad1.material.emissive.set('#999'); // char is always lit to some degree
                                        quad1.material.needsUpdate = true;
                                        quad1.geometry.buffersNeedUpdate = true;
                                        quad1.geometry.uvsNeedUpdate = true;
                                        quad1.material.transparent = quadData.transparent;
                                        // quad1.material.transparent = false;
                                        if (quadData.setVisibleOnLoad) {
                                            quadWrapper.visible = true;
                                        }
                                    });
                            });
                        }

                        quadData.__loadPromise = promise;

                        quadData._quad = quadWrapper;

                        // It's not worth it to keep the quad as a child of the original entity,
                        // because the only thing that needs to be sync'd is the position.
                        // It's hard to get the rotations and scaling right in terms of math (atleast for me)
                        // and probably also for CPU, so we just copy the position instead
                        // and set the parent to be the same as the entity's parent (usually the scene)
                        world.scene.add(quadWrapper);
                    });

                    world.entityRemoved('quad').add(function(entity) {
                        // because it was above added to the scene, now we have to manually remove it
                        var quad = entity.getComponent('quad')._quad;
                        world.scene.remove(quad);
                    });
                }

                removedFromWorld() {
                    this.world = null;
                }

                update() {
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
                        quad.position.add(quadComponent.offsetPosition);

                        var camWorldPos = new THREE.Vector3();
                        camWorldPos.setFromMatrixPosition(activeCamera.matrixWorld);
                        camWorldPos.y = quad.position.y;

                        displayUVFrame(quad.children[0],
                            quadComponent.indexH,
                            quadComponent.indexV,
                            quadComponent.numberOfSpritesH,
                            quadComponent.numberOfSpritesV,
                            quadComponent.mirror);

                        if (quadComponent.style === 'billboard') {
                            quad.lookAt(camWorldPos, quad.position, quad.up);
                        } else {
                            // Copy rotation
                            quad.quaternion.copy(quadEnt.quaternion);
                        }

                        if (mainPlayer && quadEnt === mainPlayer) {
                            var multiCamComponent = quadEnt.getScript('/scripts/built-in/character-multicam.js');
                            if (multiCamComponent) {
                                var opac = multiCamComponent.camDistanceLimit / 2;
                                opac = Math.max(opac, 0.0);
                                opac = Math.min(opac, 1.0);
                                quad.children[0].material.opacity = opac;
                            }
                        }

                    });
                }
            }

            return QuadSystem;
        }
    ]);
