angular.module('components.scene.wield-item', ['ces', 'three', 'engine.texture-loader', 'engine.util'])
    .config(function ($componentsProvider) {
        'use strict';

        $componentsProvider.addComponentData({
            'wieldItem': {
                item: 14
            }
        });
    })
    .factory('WieldItemSystem', function (System, THREE, TextureLoader, $timeout, Util) {
        'use strict';


        var WieldItemSystem = System.extend({
            addedToWorld: function (world) {
                var sys = this;

                sys._super(world);

                world.entityAdded('wieldItem').add(function (entity) {
                    var wieldItemData = entity.getComponent('wieldItem'),
                        wieldItem;

                    var planeGeo = new THREE.PlaneGeometry(1.0, 1.0, 1, 1);

                    wieldItem = new THREE.Mesh(planeGeo, new THREE.MeshLambertMaterial());
                    wieldItem.material.side = THREE.DoubleSide;
                    wieldItem.geometry.dynamic = true;

                    if (wieldItemData.item) {
                        TextureLoader.load('assets/images/items/' + wieldItemData.item + '.png')
                            .then(function (texture) {
                                // texture.needsUpdate = true;
                                wieldItem.material.map = texture;
                                wieldItem.material.needsUpdate = true;
                                wieldItem.geometry.buffersNeedUpdate = true;
                                wieldItem.geometry.uvsNeedUpdate = true;
                                wieldItem.material.transparent = true;
                            });
                    }

                    entity.renderOffset = new THREE.Vector3();

                    entity.weaponWalkSwingTimer = 0.0;


                    wieldItemData.wieldItem = wieldItem;
                    wieldItemData.weaponPivot = new THREE.Object3D();
                    wieldItemData.weaponPivot.add(wieldItem);
                    wieldItemData.weaponOrigin = new THREE.Object3D();
                    wieldItemData.weaponOrigin.add(wieldItemData.weaponPivot);


                    // Helpers (for debugging)
                    var geometry = new THREE.SphereGeometry( 0.02, 32, 32 );
                    var material1 = new THREE.MeshBasicMaterial( {color: 0xffff00} );
                    var material2 = new THREE.MeshBasicMaterial( {color: 0xff0000} );
                    var material3 = new THREE.MeshBasicMaterial( {color: 0x00ff00} );
                    var sphere1 = new THREE.Mesh( geometry, material1 );
                    var sphere2 = new THREE.Mesh( geometry, material2 );
                    var sphere3 = new THREE.Mesh( geometry, material3 );
                    wieldItemData.weaponOrigin.add(sphere1);
                    wieldItemData.weaponPivot.add(sphere2);
                    wieldItemData.wieldItem.add(sphere3);

                    // TODO: the parent is still undefined
                    // because we haven't called scene.add yet when we make this
                    // entity. Perhaps there should be another event for when the
                    // entity is added to the scene instead of using a timeout.
                    $timeout(function () {
                        entity.parent.add(wieldItemData.weaponOrigin);
                    }, 1);

                });
            },
            update: function (dt) {
                var world = this.world;


                var rigidBodies = this.world.getEntities('wieldItem');

                rigidBodies.forEach(function (entity) {
                    var wieldItemComponent = entity.getComponent('wieldItem');
                    var spriteSheetComponent = entity.getScript('/scripts/built-in/sprite-sheet.js');
                    var rigidBodyComponent = entity.getComponent('rigidBody');

                    if (spriteSheetComponent && rigidBodyComponent) {

                        var dtr = THREE.Math.degToRad;

                        var currentVel = rigidBodyComponent.rigidBody.getLinearVelocity();
                        currentVel = currentVel.toTHREEVector3();
                        var perceivedSpeed = Util.roundNumber(currentVel.lengthSq(), 2);
                        perceivedSpeed = Math.min(perceivedSpeed, 20);
                        // console.log(perceivedSpeed);

                        entity.weaponWalkSwingTimer += perceivedSpeed * 0.02;

                        // Reset everything first
                        var wo = wieldItemComponent.weaponOrigin;
                        var wp = wieldItemComponent.weaponPivot;
                        var wi = wieldItemComponent.wieldItem;

                        wp.position.set(0,0,0);
                        wp.rotation.set(0,0,0);

                        wi.position.set(0,0,0);
                        wi.rotation.set(0,0,0);
                        wi.scale.set(0.7,0.7,0.7);

                        if (_.contains([0], spriteSheetComponent.dirIndex)) {
                            // wi.rotation.y += dtr(180);
                        }

                        if (spriteSheetComponent.dirIndex === 0) {
                            wi.rotation.y += dtr(180);

                            wp.position.setX(0.40);
                            wp.position.setY(-0.2);
                            wp.position.setZ(-0.1);

                            wp.scale.setX(0.5);

                            wi.position.setX(0.25);
                            wi.position.setY(0.25);
                            wi.position.setZ(0);

                            var time = new Date().getTime() * 0.005 * ((perceivedSpeed/20));

                            wp.rotation.z += dtr(Math.cos(entity.weaponWalkSwingTimer) * 10);

                            // wi.rotation.y += dtr(45);
                            // wp.rotation.z += dtr(((new Date()).getTime() * 0.1)% 360);
                            // wi.rotateZ(Math.PI/4);
                        }


                        // TODO this logic is copied from the look-at-camera script
                        // this should probably me merged somehow
                        var entitiesWithCamera = world.getEntities('camera');

                        if (entitiesWithCamera.length) {
                            var activeCamera = entitiesWithCamera[0].getComponent('camera').camera;

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
    });
