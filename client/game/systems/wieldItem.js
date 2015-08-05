angular
    .module('game.systems.wieldItem', [
        'ces',
        'three',
        'engine.textureLoader',
        'engine.char-builder',
        'engine.util'
    ])
    .factory('WieldItemSystem', [
        'System',
        'THREE',
        'TextureLoader',
        '$timeout',
        'IbUtils',
        'CharBuilder',
        function(System, THREE, TextureLoader, $timeout, IbUtils, CharBuilder) {
            'use strict';

            var ATTACK_SWING_TIME = 0.2;

            var createItem3D = function(image) {
                var mesh,
                    itemPivot = new THREE.Object3D(),
                    item = new THREE.Object3D(),
                    planeGeo = new THREE.PlaneGeometry(1.0, 1.0, 1, 1);

                mesh = new THREE.Mesh(planeGeo, new THREE.MeshBasicMaterial());
                mesh.material.side = THREE.DoubleSide;
                mesh.geometry.dynamic = true;
                mesh.visible = false;

                CharBuilder.getSpriteSheetTile('images/spritesheets/items.png',
                    IbUtils.spriteSheetIdToXY(image).h,
                    IbUtils.spriteSheetIdToXY(image).v,
                    16, 128)
                    .then(function(url) {
                        return TextureLoader.load(url);
                    })
                    .then(function(texture) {
                        // texture.needsUpdate = true;
                        mesh.material.map = texture;
                        mesh.material.needsUpdate = true;
                        mesh.geometry.buffersNeedUpdate = true;
                        mesh.geometry.uvsNeedUpdate = true;
                        mesh.material.transparent = true;
                        mesh.visible = true;
                    });

                item.walkSwingTimer = 0.0;
                item.attackSwingTimer = 0.0;
                item.attackSwingingForward = false;

                item.doAttackAnimation = function() {
                    item.attackSwingTimer = ATTACK_SWING_TIME;
                    item.attackSwingingForward = true;
                };

                itemPivot.add(mesh);
                item.add(itemPivot);

                return item;
            };

            var updateHands = function(entity, world) {
                var wieldItemData = entity.getComponent('wieldItem');

                if (wieldItemData.rhand) {
                    // clear any previous object that might be hanging around
                    if (wieldItemData._rItem) {
                        world.scene.remove(wieldItemData._rItem);
                    }
                    wieldItemData._rItem = createItem3D(wieldItemData.rhand.image);
                    world.scene.add(wieldItemData._rItem);
                }

                if (wieldItemData.lhand) {
                    // clear any previous object that might be hanging around
                    if (wieldItemData._lItem) {
                        world.scene.remove(wieldItemData._lItem);
                    }
                    wieldItemData._lItem = createItem3D(wieldItemData.lhand.image);
                    world.scene.add(wieldItemData._lItem);
                }
            };

            var animateHand = function(world, entity, item, dt, perceivedSpeed, direction, walkIndex, isLeftHand) {
                var dtr = THREE.Math.degToRad,
                    time;

                var weaponSwingAmount = new THREE.Vector3(Math.PI / 2, 0, 0);

                item.walkSwingTimer += perceivedSpeed * 0.02;

                // Reset everything first
                var wo = item;
                var wp = wo.children[0];
                var wi = wp.children[0];

                wp.position.set(0, 0, 0);
                wp.rotation.set(0, 0, 0);

                wi.position.set(0, 0, 0);
                wi.rotation.set(0, 0, 0);
                wi.scale.set(0.7, 0.7, 0.7);

                if (direction === 0) {
                    wi.rotation.y += dtr(200);

                    wp.position.setX(0.38);
                    wp.position.setY(-0.2);
                    wp.position.setZ(-0.75);

                    wp.scale.setX(1.0);

                    wi.position.setX(0.25);
                    wi.position.setY(0.25);
                    wi.position.setZ(0);

                    time = new Date().getTime() * 0.005 * ((perceivedSpeed / 20));

                    wp.rotation.z += dtr(30);
                    wp.rotation.z += dtr(Math.cos(item.walkSwingTimer) * 10);


                    weaponSwingAmount.x = dtr(-120);
                    // wi.rotation.y += dtr(45);
                    // wp.rotation.z += dtr(((new Date()).getTime() * 0.1)% 360);
                    // wi.rotateZ(Math.PI/4);
                }

                if (direction === 1) {
                    wi.rotation.y += dtr(180);

                    wp.position.setX(0.22 + walkIndex * 0.04);
                    wp.position.setY(-0.25);
                    wp.position.setZ(-0.1);

                    wp.scale.setX(0.5);

                    wi.position.setX(0.35);
                    wi.position.setY(0.25);
                    wi.position.setZ(0);

                    time = new Date().getTime() * 0.005 * ((perceivedSpeed / 20));

                    wp.rotation.z += dtr(Math.cos(item.walkSwingTimer) * 10);

                    weaponSwingAmount.z = -weaponSwingAmount.x;
                    weaponSwingAmount.x = 0;
                }

                if (direction === 2) {
                    wi.rotation.y += dtr(180);

                    wp.position.setX(-0.1 + walkIndex * 0.1);
                    wp.position.setY(-0.25);
                    wp.position.setZ(0.2);

                    wp.scale.setX(0.8);

                    wi.position.setX(0.25);
                    wi.position.setY(0.25);
                    wi.position.setZ(0);

                    time = new Date().getTime() * 0.005 * ((perceivedSpeed / 20));

                    wp.rotation.z += dtr(Math.cos(item.walkSwingTimer) * 10);

                    weaponSwingAmount.z = -weaponSwingAmount.x;
                    weaponSwingAmount.x = 0;
                }

                if (direction === 3) {
                    wi.rotation.y += dtr(180);

                    wp.position.setX(-0.1 - walkIndex * 0.1);
                    wp.position.setY(-0.25);
                    wp.position.setZ(0.2);

                    wp.scale.setX(0.8);

                    wi.position.setX(0.25);
                    wi.position.setY(0.25);
                    wi.position.setZ(0);

                    time = new Date().getTime() * 0.005 * ((perceivedSpeed / 20));

                    wp.rotation.z += dtr(Math.cos(item.walkSwingTimer) * 10);

                    weaponSwingAmount.z = -weaponSwingAmount.x;
                    weaponSwingAmount.x = 0;
                }

                if (direction === 4) {
                    wi.rotation.y += dtr(180);

                    wp.position.setX(-0.3);
                    wp.position.setY(-0.25);
                    wp.position.setZ(0.2);

                    wp.scale.setX(-0.5);

                    wi.position.setX(0.25);
                    wi.position.setY(0.25);
                    wi.position.setZ(0);

                    time = new Date().getTime() * 0.005 * ((perceivedSpeed / 20));

                    wp.rotation.z += dtr(Math.cos(item.walkSwingTimer) * 10);

                    // wi.rotation.y += dtr(45);
                    // wp.rotation.z += dtr(((new Date()).getTime() * 0.1)% 360);
                    // wi.rotateZ(Math.PI/4);
                }

                if (direction === 5) {
                    wi.rotation.y += dtr(180);

                    wp.position.setX(-0.2 - walkIndex * 0.05);
                    wp.position.setY(-0.25);
                    wp.position.setZ(0.2);

                    wp.scale.setX(-0.8);

                    wi.position.setX(0.25);
                    wi.position.setY(0.25);
                    wi.position.setZ(0);

                    time = new Date().getTime() * 0.005 * ((perceivedSpeed / 20));

                    wp.rotation.z += dtr(Math.cos(item.walkSwingTimer) * 10);

                    weaponSwingAmount.z = weaponSwingAmount.x;
                    weaponSwingAmount.x = 0;
                }

                if (direction === 6) {
                    wi.rotation.y += dtr(180);

                    wp.position.setX(-0.1 - walkIndex * 0.05);
                    wp.position.setY(-0.25);
                    wp.position.setZ(-0.5);

                    wp.scale.setX(-1);

                    wi.position.setX(0.25);
                    wi.position.setY(0.25);
                    wi.position.setZ(0);

                    time = new Date().getTime() * 0.005 * ((perceivedSpeed / 20));

                    wp.rotation.x -= dtr(30);
                    wp.rotation.x += dtr(Math.cos(item.walkSwingTimer) * 10);

                    weaponSwingAmount.z = weaponSwingAmount.x;
                    weaponSwingAmount.x = 0;
                }

                if (direction === 7) {
                    wi.rotation.y += dtr(180);

                    wp.position.setX(0.2 - walkIndex * 0.05);
                    wp.position.setY(-0.25);
                    wp.position.setZ(-0.5);

                    wp.scale.setX(-0.8);

                    wi.position.setX(0.25);
                    wi.position.setY(0.25);
                    wi.position.setZ(0);

                    time = new Date().getTime() * 0.005 * ((perceivedSpeed / 20));

                    wp.rotation.z += dtr(Math.cos(item.walkSwingTimer) * 10);

                    weaponSwingAmount.z = weaponSwingAmount.x;
                    weaponSwingAmount.x = 0;
                }

                if (item.attackSwingTimer > 0) {
                    item.attackSwingTimer -= dt;
                }
                if (item.attackSwingTimer <= 0 &&
                    item.attackSwingingForward) {
                    item.attackSwingingForward = false;
                    item.attackSwingTimer = ATTACK_SWING_TIME;
                }

                var swingVector = new THREE.Vector3();
                var lerpAmount = (item.attackSwingTimer / ATTACK_SWING_TIME);
                if (item.attackSwingingForward) {
                    swingVector.lerp(weaponSwingAmount, (1.0 - lerpAmount));
                } else {
                    swingVector.lerp(weaponSwingAmount, lerpAmount);
                }

                wp.rotation.x += swingVector.x;
                wp.rotation.y += swingVector.y;
                wp.rotation.z += swingVector.z;

                wp.rotation.x += Math.PI / 4;

                debug.watch('weaponAttackSwingTimer', item.attackSwingTimer);

                // TODO this logic is copied from the look-at-camera script
                // this should probably me merged somehow
                var entitiesWithCamera = world.getEntities('camera');
                if (entitiesWithCamera.length) {
                    var activeCamera = entitiesWithCamera[0].getComponent('camera')._camera;

                    wo.position.copy(entity.position);

                    if (isLeftHand) {
                        // this is not really anywhere near where it should go... :)
                        wo.position.x += 1;
                    }

                    var camWorldPos = new THREE.Vector3();
                    camWorldPos.setFromMatrixPosition(activeCamera.matrixWorld);

                    wo.lookAt(camWorldPos, wp.position, wp.up);
                }
            };

            var WieldItemSystem = System.extend({
                addedToWorld: function(world) {
                    var sys = this;

                    sys._super(world);

                    function doWield(entity, slots) {
                        var wieldItemData = entity.getComponent('wieldItem') || {};

                        angular.forEach(slots, function(slot, key) {
                            wieldItemData[key] = slot;
                        });

                        if (entity.hasComponent('wieldItem')) {
                            updateHands(entity, world);
                        } else {
                            entity.addComponent('wieldItem', wieldItemData);
                        }
                    }

                    world.entityAdded('inventory').add(function(entity) {
                        // for pre-equipped
                        var inv = entity.getComponent('inventory'),
                            data = {};

                        if (inv.rhand) {
                            data.rhand = inv.rhand;
                        }

                        if (inv.lhand) {
                            data.lhand = inv.lhand;
                        }

                        if (data.rhand || data.lhand) {
                            doWield(entity, data);
                        }
                    });

                    world.subscribe('inventory:onEquipItem', function(entity, item, slot) {
                        var data = {};
                        if (slot === 'rhand' || slot === 'lhand') {
                            data[slot] = item;
                            doWield(entity, data);
                        }
                    });

                    world.subscribe('inventory:onUnEquipItem', function(entity, item, slot) {
                        var component = entity.getComponent('wieldItem');
                        if (slot === 'rhand') {
                            world.scene.remove(component._rItem);
                            component.rhand = null;
                            component._rItem = null;
                        }
                        if (slot === 'lhand') {
                            world.scene.remove(component._lItem);
                            component.lhand = null;
                            component._lItem = null;
                        }

                        // we could keep the component around, but removing it lowers loop checks
                        if (component && !component.rhand && !component.lhand) {
                            entity.removeComponent('wieldItem');
                        }
                    });

                    world.entityAdded('wieldItem').add(function(entity) {
                        updateHands(entity, world);
                    });

                    world.entityRemoved('wieldItem').add(function(entity) {
                        var component = entity.getComponent('wieldItem');
                        if (component._rItem) {
                            world.scene.remove(component._rItem);
                        }
                        if (component._lItem) {
                            world.scene.remove(component._lItem);
                        }
                    });
                },
                update: function(dt) {
                    var world = this.world,
                        rigidBodies = world.getEntities('wieldItem', 'rigidBody');

                    rigidBodies.forEach(function(entity) {
                        var wieldItemComponent = entity.getComponent('wieldItem'),
                            rigidBodyComponent = entity.getComponent('rigidBody'),
                            walkAnimationComponent = entity.getScript('/scripts/built-in/walk-animation.js'),
                            isLeftHand = false;

                        var currentVel = rigidBodyComponent.rigidBody.getLinearVelocity();
                        currentVel = currentVel.toTHREEVector3();
                        var perceivedSpeed = IbUtils.roundNumber(currentVel.lengthSq(), 2);
                        perceivedSpeed = Math.min(perceivedSpeed, 20);

                        if (wieldItemComponent._rItem) {
                            isLeftHand = false;
                            animateHand(world, entity, wieldItemComponent._rItem, dt, perceivedSpeed, walkAnimationComponent.dirIndex, walkAnimationComponent.walkIndex, isLeftHand);
                        }

                        if (wieldItemComponent._lItem) {
                            isLeftHand = true;
                            animateHand(world, entity, wieldItemComponent._lItem, dt, perceivedSpeed, walkAnimationComponent.dirIndex, walkAnimationComponent.walkIndex, isLeftHand);
                        }

                    });

                }
            });

            return WieldItemSystem;
        }
    ]);
