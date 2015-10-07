// a "shadow" is a billboard that doesn't look up
angular
    .module('game.systems.shadow', [
        'ces',
        'three',
        'engine.textureLoader'
    ])
    .factory('ShadowSystem', [
        'System',
        'THREE',
        'TextureLoader',
        '$log',
        function(System, THREE, TextureLoader, $log) {
            'use strict';

            var SHADOW_PATH = 'images/core/shadow.png';

            var ShadowSystem = System.extend({
                addedToWorld: function(world) {
                    var sys = this;

                    sys._super(world);

                    world.entityAdded('shadow').add(function(entity) {
                        var shadowData = entity.getComponent('shadow'),
                            shadow;

                        var planeGeo = new THREE.PlaneGeometry(1.0, 1.0, 1, 1);

                        shadow = new THREE.Mesh(planeGeo, new THREE.MeshLambertMaterial());
                        shadow.material.side = THREE.DoubleSide;
                        shadow.geometry.dynamic = true;

                        TextureLoader.load(SHADOW_PATH)
                            .then(function(texture) {
                                // texture.needsUpdate = true;
                                shadow.material.map = texture;
                                shadow.material.needsUpdate = true;
                                shadow.geometry.buffersNeedUpdate = true;
                                shadow.geometry.uvsNeedUpdate = true;
                                shadow.material.transparent = true;
                            });

                        shadowData.shadow = shadow;

                        shadow.rotation.x = Math.PI / 2;

                        // It's not worth it to keep the shadow as a child of the original entity,
                        // because the only thing that needs to be sync'd is the position.
                        // It's hard to get the rotations and scaling right in terms of math (atleast for me)
                        // and probably also for CPU, so we just copy the position instead
                        // and set the parent to be the same as the entity's parent (usually the scene)
                        world.scene.add(shadow);

                        entity.shadow = shadow;
                    });

                    world.entityRemoved('shadow').add(function(entity) {
                        world.scene.remove(entity.shadow);
                        // TODO possible memory leak, dispose of geometry here?
                    });
                },
                update: function() {
                    var world = this.world,
                        shadows = world.getEntities('shadow');

                    shadows.forEach(function(shadowEnt) {
                        var shadowComponent = shadowEnt.getComponent('shadow');
                        var shadow = shadowComponent.shadow;

                        if (shadowComponent.simple) {
                            var rigidBodyComponent = shadowEnt.getComponent('rigidBody');

                            var simpleHeight = shadowComponent.simpleHeight;

                            if (rigidBodyComponent) {
                                if (rigidBodyComponent.shape.type === 'sphere' && rigidBodyComponent.shape.radius) {
                                    simpleHeight = rigidBodyComponent.shape.radius;
                                }
                            }

                            shadow.position.copy(shadowEnt.position.clone().add(new THREE.Vector3(0, -simpleHeight+0.01, 0)));
                        }
                        else {
                            world.getSystem('rigidbody').rayCast(shadowEnt.position, new THREE.Vector3(0, -1, 0), 'underPlayer', function (intersections) {
                                if (intersections.length) {
                                    shadow.position.copy(intersections[0].point.add(new THREE.Vector3(0, 0.01, 0)));
                                }
                            });
                        }

                    });
                }
            });

            return ShadowSystem;
        }
    ]);
