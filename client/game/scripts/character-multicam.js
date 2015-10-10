angular
    .module('game.scripts.character-multicam', [
        'engine.scriptBank',
        'three',
        'engine.entity-cache',
        'engine.ib-config',
        'engine.util',
        'game.world-root'
    ])
    .run([
        '$log',
        'ScriptBank',
        'IbConfig',
        'THREE',
        'IbUtils',
        '$meteor',
        '$entityCache',
        '$rootWorld',
        function($log, ScriptBank, IbConfig, THREE, IbUtils, $meteor, $entityCache, $rootWorld) {
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

            var targetPosition = new THREE.Vector3(0, 0, 0);

            var originalThirdPersonPosition = new THREE.Vector3(0, 1.5, 4);
            var originalThirdPersonPositionLength = originalThirdPersonPosition.length();
            var originalThirdPersonPositionNormalizedYCoordinate = originalThirdPersonPosition.clone().normalize().y;

            var originalCameraThirdPersonLookAtTargetOffset = new THREE.Vector3(0, 0, -2);
            var cameraThirdPersonLookAtTargetOffset = originalCameraThirdPersonLookAtTargetOffset.clone();

            var mouseSpeed = 0.004;

            var PI_2 = Math.PI / 2;

            var bind = function(scope, fn) {
                return function() {
                    fn.apply(scope, arguments);
                };
            };

            var detachedCam;
            var localCam;

            var cameraThirdPersonLookAtTarget = new THREE.Vector3();

            var MultiCamScript = function(entity, world) {
                var me = this;

                this.entity = entity;
                this.world = world;

                this.thirdPersonPosition = originalThirdPersonPosition.clone();
                this.camDistanceLimit = 0;
                this.temporarilyDisableAutoCameraCorrection = false;

                var user = Meteor.user();
                this.cameraType = (user && user.profile && user.profile.cameraType) ? user.profile.cameraType : 'arcade';

                var cameraComponent = this.entity.getComponent('camera');

                if (cameraComponent) {
                    cameraComponent._camera.rotation.set(0, 0, 0);
                }

                detachedCam = cameraComponent._camera.clone();

                // TODO: move this event listener some place else
                // maybe to constructor of Camera somehow?
                // it's annoying that the clone() doesn't do this
                window.addEventListener('resize', function() {
                    detachedCam.aspect = window.innerWidth / window.innerHeight;
                    detachedCam.updateProjectionMatrix();
                }, false);

                entity.parent.add(detachedCam);

                localCam = cameraComponent._camera;
                cameraComponent._camera = detachedCam;

                IbConfig.get('domElement').addEventListener('mousemove', bind(this, this.onMouseMove), false);
            };

            MultiCamScript.prototype.onMouseMove = function(event) {
                var movementX = event.movementX || event.mozMovementX || 0;
                var movementY = event.movementY || event.mozMovementY || 0;

                lon += movementX;
                lat -= movementY;

                lat = Math.max(-85, Math.min(85, lat));
                phi = (90 - lat) * Math.PI / 180;
                theta = lon * Math.PI / 180;

                var position = this.entity.position;

                targetPosition.x = position.x + 100 * Math.sin(phi) * Math.cos(theta);
                targetPosition.y = position.y + 100 * Math.cos(phi);
                targetPosition.z = position.z + 100 * Math.sin(phi) * Math.sin(theta);
            };

            MultiCamScript.prototype.changeCamera = function() {
                if (this.cameraType === 'arcade') {
                    this.cameraType = 'locked';
                }
                else if (this.cameraType === 'locked') {
                    this.cameraType = 'classic';
                }
                else {
                    this.cameraType = 'arcade';
                }

                // is this the best place for this?
                $meteor.call('updateProfile', 'cameraType', this.cameraType);
            };

            MultiCamScript.prototype.update = function(dt, elapsed, timestamp) {
                var cameraComponent = this.entity.getComponent('camera');

                var mainPlayer = $entityCache.get('mainPlayer');

                if (cameraComponent) {
                    if (mainPlayer) {

                        var cheatComponent = mainPlayer.getComponent('cheats');
                        if (cheatComponent) {
                            if (cheatComponent.screenshot) {
                                return;
                            }
                        }

                        if (camMode === camModeEnum.FirstPerson) {
                            localCam.lookAt(targetPosition);

                            mainPlayer.quaternion.copy(localCam.quaternion);
                            localCam.quaternion.copy(new THREE.Quaternion());
                        }
                        if (camMode === camModeEnum.ThirdPerson) {

                            localCam.position.copy(this.thirdPersonPosition);

                            cameraThirdPersonLookAtTargetOffset.copy(originalCameraThirdPersonLookAtTargetOffset, dt * 5);


                            // Make sure the cam doesn't go through walls here
                            // by raycasting
                            var me = this;

                            me.camDistanceLimit = originalThirdPersonPositionLength;

                            var normalizedThirdPersonPosition = me.thirdPersonPosition.clone();
                            normalizedThirdPersonPosition.normalize();

                            this.world.getSystem('rigidbody').rayCast(mainPlayer.position.clone().add(normalizedThirdPersonPosition.clone().multiplyScalar(0.55)),
                                normalizedThirdPersonPosition, 'camWall', function (intersections) {
                                if (intersections.length) {
                                    var dist = intersections[0].point.sub(mainPlayer.position).length();

                                    if (dist < originalThirdPersonPositionLength) {
                                        me.camDistanceLimit = dist;
                                    }
                                }

                                me.thirdPersonPosition.normalize();
                                me.thirdPersonPosition.y = originalThirdPersonPositionNormalizedYCoordinate;
                                me.thirdPersonPosition.multiplyScalar(me.camDistanceLimit);
                            });

                            var worldPos = new THREE.Vector3();
                            worldPos.setFromMatrixPosition(localCam.matrixWorld);
                            detachedCam.position.lerp(mainPlayer.position.clone().add(this.thirdPersonPosition), dt * 4);

                            cameraThirdPersonLookAtTargetOffset.applyEuler(new THREE.Euler(0, IbUtils.vecToEuler(this.thirdPersonPosition) + Math.PI/2, 0));
                            cameraThirdPersonLookAtTarget.lerp(mainPlayer.position.clone().add(cameraThirdPersonLookAtTargetOffset), dt * 4);

                            detachedCam.lookAt(cameraThirdPersonLookAtTarget);

                            var vectorThatIsAlwaysBehindThePlayer = originalThirdPersonPosition.clone();

                            vectorThatIsAlwaysBehindThePlayer.applyQuaternion(mainPlayer.quaternion);
                            // debug.drawVector(vectorThatIsAlwaysBehindThePlayer, this.entity.position);

                            if (!this.temporarilyDisableAutoCameraCorrection && this.cameraType === 'arcade') {
                                this.thirdPersonPosition.lerp(vectorThatIsAlwaysBehindThePlayer, dt * 2.5);
                            }

                            // debug.watch('cameraThirdPersonLookAtTarget', cameraThirdPersonLookAtTarget);
                            // debug.watch('detachedCam.position', detachedCam.position);
                        }
                    }
                    else {
                        var multiplier = 1.0;

                        //var magic = 35;
                        var magic = 2;

                        var activeLevel = $rootWorld.name;

                        if (activeLevel === 'dev-zone') {
                            cameraComponent._camera.position.set(Math.sin(elapsed * multiplier / 20) * -18, 5, Math.cos(elapsed * multiplier / 20) * 18);
                            cameraComponent._camera.lookAt(new THREE.Vector3());
                        }
                        else {
                            cameraComponent._camera.position.set(Math.sin(elapsed * multiplier / 20) * -18, 30 + (magic + 2) + Math.cos(elapsed * multiplier / 20) * magic, Math.cos(elapsed * multiplier / 20) * 18);
                            cameraComponent._camera.rotation.set(0, -elapsed * multiplier / 20, 0);
                        }
                    }
                }
            };

            ScriptBank.add('/scripts/built-in/character-multicam.js', MultiCamScript);
        }
    ]);
