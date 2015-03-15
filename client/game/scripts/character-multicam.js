angular.module('game.scripts.character-multicam', ['components.script'])
    .run(function ($log, ScriptBank, IbConfig, THREE) {
        'use strict';

        // The multicam gives you first and third person in one script
        // When in third person, you control your character with the arrow/wasd keys only
        // In first person, you control it with the mouse and arrow/wasd
        // Using the 'V' key you can switch between these views. (later add mousewheel support)

        var camModeEnum = {
            FirstPerson: 1,
            FirstPersonToThirdPerson: 2,
            ThirdPerson: 3,
            ThirdPersonToFirstPerson: 4
        };

        var camMode = camModeEnum.ThirdPerson;

        var lat = 0;
        var lon = -90;
        var phi = 0;
        var theta = 0;

        var targetPosition = new THREE.Vector3( 0, 0, 0 );

        var originalThirdPersonPosition = new THREE.Vector3(0, 1.5, 4);
        var originalThirdPersonPositionLength = originalThirdPersonPosition.length();

        var originalCameraThirdPersonLookAtTargetOffset = new THREE.Vector3(0, 1, -1);
        var cameraThirdPersonLookAtTargetOffset = originalCameraThirdPersonLookAtTargetOffset.clone();

        var mouseSpeed = 0.004;

        var PI_2 = Math.PI / 2;

        var bind = function (scope, fn) {
            return function () {
                fn.apply(scope, arguments);
            };
        };

        var detachedCam;
        var localCam;

        var cameraThirdPersonLookAtTarget = new THREE.Vector3();

        var MultiCamScript = function (entity, world) {
            var me = this;

            this.entity = entity;
            this.world = world;

            var cameraComponent = this.entity.getComponent('camera');

            if (cameraComponent) {
                cameraComponent.camera.rotation.set( 0, 0, 0 );
            }

            detachedCam = cameraComponent.camera.clone();

            // TODO: move this event listener some place else
            // maybe to constructor of Camera somehow?
            // it's annoying that the clone() doesn't do this
            window.addEventListener('resize', function () {
                detachedCam.aspect = window.innerWidth / window.innerHeight;
                detachedCam.updateProjectionMatrix();
            }, false );

            entity.parent.add(detachedCam);

            localCam = cameraComponent.camera;
            cameraComponent.camera = detachedCam;

            IbConfig.get('domElement').addEventListener( 'mousemove', bind(this, this.onMouseMove), false );
        };

        MultiCamScript.prototype.onMouseMove = function ( event ) {
            var movementX = event.movementX || event.mozMovementX || event.webkitMovementX || 0;
            var movementY = event.movementY || event.mozMovementY || event.webkitMovementY || 0;

            lon += movementX;
            lat -= movementY;

            lat = Math.max( - 85, Math.min( 85, lat ) );
            phi = ( 90 - lat ) * Math.PI / 180;
            theta = lon * Math.PI / 180;

            var position = this.entity.position;

            targetPosition.x = position.x + 100 * Math.sin( phi ) * Math.cos( theta );
            targetPosition.y = position.y + 100 * Math.cos( phi );
            targetPosition.z = position.z + 100 * Math.sin( phi ) * Math.sin( theta );


        };

        MultiCamScript.prototype.update = function (dt, elapsed, timestamp) {
            var cameraComponent = this.entity.getComponent('camera');

            if (cameraComponent) {
                if (camMode === camModeEnum.FirstPerson) {
                    localCam.lookAt(targetPosition);

                    this.entity.quaternion.copy(localCam.quaternion);
                    localCam.quaternion.copy(new THREE.Quaternion());
                }
                if (camMode === camModeEnum.ThirdPerson) {

                    localCam.position.copy(originalThirdPersonPosition);

                    cameraThirdPersonLookAtTargetOffset.copy(originalCameraThirdPersonLookAtTargetOffset, dt*5);


                    // Make sure the cam doesn't go through walls here
                    // by raycasting
                    var scenes = this.world.getEntities('scene');

                    if (scenes.length) {
                        var octree = scenes[0].octree;

                        var rotatedOriginalThirdPersonPosition = originalThirdPersonPosition.clone();
                        rotatedOriginalThirdPersonPosition.applyQuaternion( this.entity.quaternion );
                        rotatedOriginalThirdPersonPosition.normalize();

                        var ray = new THREE.Raycaster(this.entity.position, rotatedOriginalThirdPersonPosition);

                        // debug.drawVector(rotatedOriginalThirdPersonPosition, this.entity.position);

                        var intersections = ray.intersectOctreeObjects(octree.objects);

                        if (intersections.length) {
                            var dist = intersections[0].distance;
                            // debug.watch('cam ray distance', dist);

                            dist -= 1;

                            if (dist < originalThirdPersonPositionLength) {
                                // cameraThirdPersonLookAtTargetOffset.z = -10;
                                cameraThirdPersonLookAtTargetOffset.lerp(originalCameraThirdPersonLookAtTargetOffset.clone().add(new THREE.Vector3(0, -5, -20)), dt*5);
                            }
                            else {
                                // cameraThirdPersonLookAtTargetOffset.copy(originalCameraThirdPersonLookAtTargetOffset, dt*5);
                            }

                            localCam.position.normalize();
                            localCam.position.multiplyScalar(dist > originalThirdPersonPositionLength ?
                                originalThirdPersonPositionLength : dist);
                            localCam.position.y = Math.max(localCam.position.y, 0.5);
                        }
                        else {
                            localCam.position.copy(originalThirdPersonPosition);
                            // cameraThirdPersonLookAtTargetOffset.copy(originalCameraThirdPersonLookAtTargetOffset, dt*5);
                        }
                    }

                    var worldPos = new THREE.Vector3();
                    worldPos.setFromMatrixPosition(localCam.matrixWorld);
                    detachedCam.position.lerp(worldPos, dt*5);


                    cameraThirdPersonLookAtTargetOffset.applyQuaternion( this.entity.quaternion );
                    cameraThirdPersonLookAtTarget.lerp(this.entity.position.clone().add(cameraThirdPersonLookAtTargetOffset), dt*5);
                    detachedCam.lookAt(cameraThirdPersonLookAtTarget);
                }
            }
        };

        ScriptBank.add('/scripts/built-in/character-multicam.js', MultiCamScript);
    });
