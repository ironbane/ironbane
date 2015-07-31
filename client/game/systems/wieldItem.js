angular
    .module('game.systems.wieldItem', [
        'ces',
        'three',
        'engine.textureLoader',
        'engine.util'
    ])
    .factory('WieldItemSystem', [
        'System',
        'THREE',
        'TextureLoader',
        '$timeout',
        'IbUtils',
        function(System, THREE, TextureLoader, $timeout, IbUtils) {
            'use strict';

            var weaponAttackSwingTime = 0.2;

            var WieldItemSystem = System.extend({
                addedToWorld: function(world) {
                    var sys = this;

                    sys._super(world);

                    world.subscribe('inventory:onEquipItem', function(entity, item) {
                        if (item.type === 'weapon') {
                            // this assumes that wieldItem has been added through some legitimate inventory means
                            // if it was just added, it will get replaced, but nothing will go into inventory
                            // also need to test this because we can never add 2 of the same component
                            if (entity.hasComponent('wieldItem')) {
                                var wieldItemComponent = entity.getComponent('wieldItem');
                                // update the image
                                wieldItemComponent.item = item.image;
                                // TODO: call update texture method
                            } else {
                                entity.addComponent('wieldItem', {
                                    item: item.image
                                });
                            }
                        }
                    });

                    world.subscribe('inventory:onUnEquipItem', function(entity, item) {
                        if (item.type === 'weapon') {
                            entity.removeComponent('wieldItem');
                        }
                    });

                    world.entityAdded('wieldItem').add(function(entity) {
                        var wieldItemData = entity.getComponent('wieldItem'),
                            wieldItem;

                        var planeGeo = new THREE.PlaneGeometry(1.0, 1.0, 1, 1);

                        wieldItem = new THREE.Mesh(planeGeo, new THREE.MeshBasicMaterial());
                        wieldItem.material.side = THREE.DoubleSide;
                        wieldItem.geometry.dynamic = true;

                        if (wieldItemData.item) {
                            TextureLoader.load('images/items/' + wieldItemData.item + '.png')
                                .then(function(texture) {
                                    // texture.needsUpdate = true;
                                    wieldItem.material.map = texture;
                                    wieldItem.material.needsUpdate = true;
                                    wieldItem.geometry.buffersNeedUpdate = true;
                                    wieldItem.geometry.uvsNeedUpdate = true;
                                    wieldItem.material.transparent = true;
                                });
                        }

                        wieldItemData.weaponWalkSwingTimer = 0.0;
                        wieldItemData.weaponAttackSwingTimer = 0.0;
                        wieldItemData.weaponAttackSwingingForward = false;


                        wieldItemData.doAttackAnimation = function() {
                            wieldItemData.weaponAttackSwingTimer = weaponAttackSwingTime;
                            wieldItemData.weaponAttackSwingingForward = true;
                        };


                        wieldItemData.wieldItem = wieldItem;
                        wieldItemData.weaponPivot = new THREE.Object3D();
                        wieldItemData.weaponPivot.add(wieldItem);
                        wieldItemData.weaponOrigin = new THREE.Object3D();
                        wieldItemData.weaponOrigin.add(wieldItemData.weaponPivot);


                        // Helpers (for debugging)
                        // var geometry = new THREE.SphereGeometry(0.02, 32, 32);
                        // var material1 = new THREE.MeshBasicMaterial({
                        //     color: 0xffff00
                        // });
                        // var material2 = new THREE.MeshBasicMaterial({
                        //     color: 0xff0000
                        // });
                        // var material3 = new THREE.MeshBasicMaterial({
                        //     color: 0x00ff00
                        // });
                        // var sphere1 = new THREE.Mesh(geometry, material1);
                        // var sphere2 = new THREE.Mesh(geometry, material2);
                        // var sphere3 = new THREE.Mesh(geometry, material3);
                        // wieldItemData.weaponOrigin.add(sphere1);
                        // wieldItemData.weaponPivot.add(sphere2);
                        // wieldItemData.wieldItem.add(sphere3);

                        // add it directly to the scene because it's easier
                        world.scene.add(wieldItemData.weaponOrigin);
                    });

                    world.entityRemoved('wieldItem').add(function(entity) {
                        var component = entity.getComponent('wieldItem');
                        world.scene.remove(component.weaponOrigin);
                    });
                },
                update: function(dt) {
                    var world = this.world;


                    var rigidBodies = this.world.getEntities('wieldItem');

                    rigidBodies.forEach(function(entity) {
                        var wieldItemComponent = entity.getComponent('wieldItem');
                        var walkAnimationComponent = entity.getScript('/scripts/built-in/walk-animation.js');
                        var rigidBodyComponent = entity.getComponent('rigidBody');

                        if (walkAnimationComponent && rigidBodyComponent) {

                            var dtr = THREE.Math.degToRad;

                            var currentVel = rigidBodyComponent.rigidBody.getLinearVelocity();
                            currentVel = currentVel.toTHREEVector3();
                            var perceivedSpeed = IbUtils.roundNumber(currentVel.lengthSq(), 2);
                            perceivedSpeed = Math.min(perceivedSpeed, 20);
                            // console.log(perceivedSpeed);

                            wieldItemComponent.weaponWalkSwingTimer += perceivedSpeed * 0.02;

                            // Reset everything first
                            var wo = wieldItemComponent.weaponOrigin;
                            var wp = wieldItemComponent.weaponPivot;
                            var wi = wieldItemComponent.wieldItem;

                            wp.position.set(0, 0, 0);
                            wp.rotation.set(0, 0, 0);

                            wi.position.set(0, 0, 0);
                            wi.rotation.set(0, 0, 0);
                            wi.scale.set(0.7, 0.7, 0.7);

                            if (_.contains([0], walkAnimationComponent.dirIndex)) {
                                // wi.rotation.y += dtr(180);
                            }

                            var weaponSwingAmount = new THREE.Vector3(Math.PI / 2, 0, 0);


                            if (walkAnimationComponent.dirIndex === 0) {
                                wi.rotation.y += dtr(200);

                                wp.position.setX(0.38);
                                wp.position.setY(-0.2);
                                wp.position.setZ(-0.75);

                                wp.scale.setX(1.0);

                                wi.position.setX(0.25);
                                wi.position.setY(0.25);
                                wi.position.setZ(0);

                                var time = new Date().getTime() * 0.005 * ((perceivedSpeed / 20));

                                wp.rotation.z += dtr(30);
                                wp.rotation.z += dtr(Math.cos(wieldItemComponent.weaponWalkSwingTimer) * 10);


                                weaponSwingAmount.x = dtr(-120);
                                // wi.rotation.y += dtr(45);
                                // wp.rotation.z += dtr(((new Date()).getTime() * 0.1)% 360);
                                // wi.rotateZ(Math.PI/4);
                            }

                            if (walkAnimationComponent.dirIndex === 1) {
                                wi.rotation.y += dtr(180);

                                wp.position.setX(0.22 + walkAnimationComponent.walkIndex * 0.04);
                                wp.position.setY(-0.25);
                                wp.position.setZ(-0.1);

                                wp.scale.setX(0.5);

                                wi.position.setX(0.35);
                                wi.position.setY(0.25);
                                wi.position.setZ(0);

                                var time = new Date().getTime() * 0.005 * ((perceivedSpeed / 20));

                                wp.rotation.z += dtr(Math.cos(wieldItemComponent.weaponWalkSwingTimer) * 10);

                                weaponSwingAmount.z = -weaponSwingAmount.x;
                                weaponSwingAmount.x = 0;
                            }

                            if (walkAnimationComponent.dirIndex === 2) {
                                wi.rotation.y += dtr(180);

                                wp.position.setX(-0.1 + walkAnimationComponent.walkIndex * 0.1);
                                wp.position.setY(-0.25);
                                wp.position.setZ(0.2);

                                wp.scale.setX(0.8);

                                wi.position.setX(0.25);
                                wi.position.setY(0.25);
                                wi.position.setZ(0);

                                var time = new Date().getTime() * 0.005 * ((perceivedSpeed / 20));

                                wp.rotation.z += dtr(Math.cos(wieldItemComponent.weaponWalkSwingTimer) * 10);

                                weaponSwingAmount.z = -weaponSwingAmount.x;
                                weaponSwingAmount.x = 0;
                            }

                            if (walkAnimationComponent.dirIndex === 3) {
                                wi.rotation.y += dtr(180);

                                wp.position.setX(-0.1 - walkAnimationComponent.walkIndex * 0.1);
                                wp.position.setY(-0.25);
                                wp.position.setZ(0.2);

                                wp.scale.setX(0.8);

                                wi.position.setX(0.25);
                                wi.position.setY(0.25);
                                wi.position.setZ(0);

                                var time = new Date().getTime() * 0.005 * ((perceivedSpeed / 20));

                                wp.rotation.z += dtr(Math.cos(wieldItemComponent.weaponWalkSwingTimer) * 10);

                                weaponSwingAmount.z = -weaponSwingAmount.x;
                                weaponSwingAmount.x = 0;
                            }

                            if (walkAnimationComponent.dirIndex === 4) {
                                wi.rotation.y += dtr(180);

                                wp.position.setX(-0.3);
                                wp.position.setY(-0.25);
                                wp.position.setZ(0.2);

                                wp.scale.setX(-0.5);

                                wi.position.setX(0.25);
                                wi.position.setY(0.25);
                                wi.position.setZ(0);

                                var time = new Date().getTime() * 0.005 * ((perceivedSpeed / 20));

                                wp.rotation.z += dtr(Math.cos(wieldItemComponent.weaponWalkSwingTimer) * 10);

                                // wi.rotation.y += dtr(45);
                                // wp.rotation.z += dtr(((new Date()).getTime() * 0.1)% 360);
                                // wi.rotateZ(Math.PI/4);
                            }

                            if (walkAnimationComponent.dirIndex === 5) {
                                wi.rotation.y += dtr(180);

                                wp.position.setX(-0.2 - walkAnimationComponent.walkIndex * 0.05);
                                wp.position.setY(-0.25);
                                wp.position.setZ(0.2);

                                wp.scale.setX(-0.8);

                                wi.position.setX(0.25);
                                wi.position.setY(0.25);
                                wi.position.setZ(0);

                                var time = new Date().getTime() * 0.005 * ((perceivedSpeed / 20));

                                wp.rotation.z += dtr(Math.cos(wieldItemComponent.weaponWalkSwingTimer) * 10);

                                weaponSwingAmount.z = weaponSwingAmount.x;
                                weaponSwingAmount.x = 0;
                            }

                            if (walkAnimationComponent.dirIndex === 6) {
                                wi.rotation.y += dtr(180);

                                wp.position.setX(-0.1 - walkAnimationComponent.walkIndex * 0.05);
                                wp.position.setY(-0.25);
                                wp.position.setZ(-0.5);

                                wp.scale.setX(-1);

                                wi.position.setX(0.25);
                                wi.position.setY(0.25);
                                wi.position.setZ(0);

                                var time = new Date().getTime() * 0.005 * ((perceivedSpeed / 20));

                                wp.rotation.x -= dtr(30);
                                wp.rotation.x += dtr(Math.cos(wieldItemComponent.weaponWalkSwingTimer) * 10);

                                weaponSwingAmount.z = weaponSwingAmount.x;
                                weaponSwingAmount.x = 0;
                            }

                            if (walkAnimationComponent.dirIndex === 7) {
                                wi.rotation.y += dtr(180);

                                wp.position.setX(0.2 - walkAnimationComponent.walkIndex * 0.05);
                                wp.position.setY(-0.25);
                                wp.position.setZ(-0.5);

                                wp.scale.setX(-0.8);

                                wi.position.setX(0.25);
                                wi.position.setY(0.25);
                                wi.position.setZ(0);

                                var time = new Date().getTime() * 0.005 * ((perceivedSpeed / 20));

                                wp.rotation.z += dtr(Math.cos(wieldItemComponent.weaponWalkSwingTimer) * 10);

                                weaponSwingAmount.z = weaponSwingAmount.x;
                                weaponSwingAmount.x = 0;
                            }

                            if (wieldItemComponent.weaponAttackSwingTimer > 0) {
                                wieldItemComponent.weaponAttackSwingTimer -= dt;
                            }
                            if (wieldItemComponent.weaponAttackSwingTimer <= 0 &&
                                wieldItemComponent.weaponAttackSwingingForward) {
                                wieldItemComponent.weaponAttackSwingingForward = false;
                                wieldItemComponent.weaponAttackSwingTimer = weaponAttackSwingTime;
                            }

                            var swingVector = new THREE.Vector3();
                            var lerpAmount = (wieldItemComponent.weaponAttackSwingTimer / weaponAttackSwingTime);
                            if (wieldItemComponent.weaponAttackSwingingForward) {
                                swingVector.lerp(weaponSwingAmount, (1.0 - lerpAmount));
                            } else {
                                swingVector.lerp(weaponSwingAmount, lerpAmount);
                            }

                            wp.rotation.x += swingVector.x;
                            wp.rotation.y += swingVector.y;
                            wp.rotation.z += swingVector.z;

                            wp.rotation.x += Math.PI / 4;

                            debug.watch('weaponAttackSwingTimer', wieldItemComponent.weaponAttackSwingTimer);


                            // TODO this logic is copied from the look-at-camera script
                            // this should probably me merged somehow
                            var entitiesWithCamera = world.getEntities('camera');

                            if (entitiesWithCamera.length) {
                                var activeCamera = entitiesWithCamera[0].getComponent('camera')._camera;

                                wo.position.copy(entity.position);

                                var parent = entity.parent;
                                var camWorldPos = new THREE.Vector3();
                                camWorldPos.setFromMatrixPosition(activeCamera.matrixWorld);

                                wo.lookAt(camWorldPos, wp.position, wp.up);
                            }

                        }
                    });

                }
            });

            return WieldItemSystem;
        }
    ]);
