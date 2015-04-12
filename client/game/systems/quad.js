// a "quad" is a billboard that doesn't look up
angular
    .module('game.systems.quad', [
        'ces',
        'three',
        'engine.textureLoader',
        'engine.char-builder'
    ])
    .factory('QuadSystem', [
        'System',
        'THREE',
        'TextureLoader',
        '$log',
        '$q',
        'CharBuilder',
        function(System, THREE, TextureLoader, $log, $q, CharBuilder) {
            'use strict';

            var QuadSystem = System.extend({
                addedToWorld: function(world) {
                    var sys = this;

                    sys._super(world);

                    world.entityAdded('quad').add(function(entity) {
                        var quadData = entity.getComponent('quad'),
                            quad;

                        var planeGeo = new THREE.PlaneGeometry(1.0, 1.0, 1, 1);

                        quad = new THREE.Mesh(planeGeo, new THREE.MeshLambertMaterial());
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
                                        // loadedTexture.needsUpdate = true;
                                        quad.material.map = loadedTexture;
                                        quad.material.needsUpdate = true;
                                        quad.geometry.buffersNeedUpdate = true;
                                        quad.geometry.uvsNeedUpdate = true;
                                        quad.material.transparent = quadData.transparent;
                                    });
                            });
                        }

                        quadData.quad = quad;
                        // It's not worth it to keep the quad as a child of the original entity,
                        // because the only thing that needs to be sync'd is the position.
                        // It's hard to get the rotations and scaling right in terms of math (atleast for me)
                        // and probably also for CPU, so we just copy the position instead
                        // and set the parent to be the same as the entity's parent (usually the scene)
                        world.scene.add(quad);
                    });

                    world.entityRemoved('quad').add(function(entity) {
                        // because it was above added to the scene, now we have to manually remove it
                        var quad = entity.getComponent('quad').quad;
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
                        activeCamera = entitiesWithCamera[0].getComponent('camera').camera;
                    }

                    if (!activeCamera) {
                        //$log.warn('No camera to look at!');
                        return;
                    }

                    quads.forEach(function(quadEnt) {
                        var quad = quadEnt.getComponent('quad').quad;
                        if (!quad) {
                            //$log.warn('quad not loaded for entity', quadEnt);
                            return;
                        }
                        quad.position.copy(quadEnt.position);

                        var camWorldPos = new THREE.Vector3();
                        camWorldPos.setFromMatrixPosition(activeCamera.matrixWorld);

                        camWorldPos.y = quad.position.y;

                        quad.lookAt(camWorldPos, quad.position, quad.up);
                    });
                }
            });

            return QuadSystem;
        }
    ]);
