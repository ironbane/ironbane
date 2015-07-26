angular
    .module('game.scripts.character-controller', [
        'engine.scriptBank',
        'three',
        'ammo',
        'engine.debugger',
        'engine.util',
        'game.clientSettings'
    ])
    .run([
        '$log',
        'ScriptBank',
        'THREE',
        'Ammo',
        'Debugger',
        'IbUtils',
        '$clientSettings',
        function($log, ScriptBank, THREE, Ammo, Debugger, IbUtils, $clientSettings) {
            'use strict';

            // The amount of time that must pass before you can jump again
            var minimumJumpDelay = 0.4;

            var btVec3 = new Ammo.btVector3();

            var CharacterControllerScript = function(entity, world) {
                Debugger.watch('player.position', entity.position);

                this.entity = entity;
                this.world = world;

                this.moveForward = false;
                this.moveBackward = false;
                this.rotateLeft = false;
                this.rotateRight = false;

                this.moveLeft = false;
                this.moveRight = false;

                this.canJump = true;
                this.jump = false;
                this.jumpTimer = 0.0;

                this.activeCollisions = [];

                var collisionReporterComponent = entity.getComponent('collisionReporter');

                var me = this;

                if (collisionReporterComponent) {
                    collisionReporterComponent.collisionStart.add(function(contact) {
                        me.activeCollisions.push(contact);
                    });
                    collisionReporterComponent.collisionEnd.add(function(contact) {
                        me.activeCollisions.splice(me.activeCollisions.indexOf(contact), 1);
                    });
                }
            };

            CharacterControllerScript.prototype.update = function(dt, elapsed, timestamp) {

                if ($clientSettings.get('isAdminPanelOpen')) {
                    return;
                }

                var input = this.world.getSystem('input'), // should cache this during init?
                    leftStick = input.virtualGamepad.leftThumbstick,
                    rightStick = input.virtualGamepad.rightThumbstick;

                // reset these every frame
                this.moveForward = false;
                this.moveBackward = false;
                this.rotateLeft = false;
                this.rotateRight = false;
                this.moveLeft = false;
                this.moveRight = false;
                this.jump = false;
                this.canJump = false;

                this.jumpTimer += dt;

                var rigidBodyComponent = this.entity.getComponent('rigidBody'),
                    speedComponent = this.entity.getComponent('speed');

                if (!speedComponent) {
                    // TODO: perhaps defaults, or something else, or perhaps this is good
                    $log.warn('Entity has no speed component, cant move!');
                    return;
                }

                if (rigidBodyComponent) {
                    // We only set a friction when the character is on the ground, to prevent
                    // side-friction from allowing character to stop in midair
                    // First reset the friction here
                    rigidBodyComponent.rigidBody.setFriction(0.7);
                }

                var entitiesWithOctree = this.world.getEntities('octree');
                // TODO cache raycasts, this needs to raycast again which could actually use the one
                // used from the shadow. Perhaps a raycastmanager of some sort is needed.

                // Reset just to be sure
                this.canJump = false;

                var me = this;

                if (entitiesWithOctree.length) {
                    // assuming only one? technically there could be many...
                    entitiesWithOctree.forEach(function(octreeEntity) {
                        var octree = octreeEntity.getComponent('octree').octreeResultsNearPlayer;

                        if (octree) {
                            var ray = new THREE.Raycaster(me.entity.position, new THREE.Vector3(0, -1, 0));

                            var intersections = ray.intersectOctreeObjects(octree);

                            if (intersections.length) {
                                if (intersections[0].distance <= 0.55) {
                                    // We can jump when the ray distance is less than 0.5, since the player pos is at 0.5 and is 1 in height.
                                    // Add 0.05 to take into account slopes, which have a small offset when casting rays downwards = 0.55
                                    me.canJump = true;
                                } else {
                                    // Get rid of friction so we don't slow down on the walls while falling
                                    rigidBodyComponent.rigidBody.setFriction(0.0);
                                }
                            }
                        }
                    })
                }

                if (this.entity.metadata.cheats && this.entity.metadata.cheats.jump) {
                    this.canJump = true;
                    this.jumpTimer = minimumJumpDelay * 2;
                }

                // virtual gamepad (touch ipad) controls
                if (leftStick) {
                    if (leftStick.delta.y < 0) {
                        this.moveForward = true;
                    }
                    if (leftStick.delta.y > 0) {
                        this.moveBackward = true;
                    }

                    if (leftStick.delta.x < 0) {
                        this.rotateLeft = true;
                    }
                    if (leftStick.delta.x > 0) {
                        this.rotateRight = true;
                    }
                }
                // right now just use right stick as jump
                if (rightStick) {
                    this.jump = true;
                }

                if (input.mouse.getButton(0)) {
                    var mouseHelper = this.entity.getComponent('mouseHelper');
                    if (mouseHelper) {
                        var fighter = this.entity.getComponent('fighter');
                        if (fighter) {

                            var toTarget = mouseHelper.target.clone().sub(this.entity.position);

                            if (toTarget.lengthSq() > mouseHelper.range * mouseHelper.range) {
                                toTarget.normalize().multiplyScalar(mouseHelper.range);
                            }

                            fighter.attack(this.entity.position.clone().add(toTarget));
                        }
                    }
                }

                // keyboard controls
                if (input.keyboard.getKey(input.KEYS.W) || input.keyboard.getKey(input.KEYS.UP)) {
                    this.moveForward = true;
                }

                if (input.keyboard.getKey(input.KEYS.S) || input.keyboard.getKey(input.KEYS.DOWN)) {
                    this.moveBackward = true;
                }

                if (input.keyboard.getKey(input.KEYS.A) || input.keyboard.getKey(input.KEYS.LEFT)) {
                    this.moveLeft = true;
                }

                if (input.keyboard.getKey(input.KEYS.D) || input.keyboard.getKey(input.KEYS.RIGHT)) {
                    this.moveRight = true;
                }

                if (input.keyboard.getKey(input.KEYS.Q)) {
                    this.rotateLeft = true;
                }

                if (input.keyboard.getKey(input.KEYS.E)) {
                    this.rotateRight = true;
                }

                if (input.keyboard.getKey(input.KEYS.SPACE)) {
                    this.jump = true;
                }

                var inputVector = new THREE.Vector3();

                // react to changes
                if (this.moveForward) {
                    inputVector.z -= 1;
                }
                if (this.moveBackward) {
                    inputVector.z += 1;
                }
                if (this.moveLeft) {
                    inputVector.x -= 1;
                }
                if (this.moveRight) {
                    inputVector.x += 1;
                }

                var multiCamComponent = this.entity.getScript('/scripts/built-in/character-multicam.js');

                // Make sure they can't gain extra speed if moving diagonally
                inputVector.normalize();

                if (inputVector.lengthSq() > 0.01) {
                    multiCamComponent.temporarilyDisableAutoCameraCorrection = false;
                }

                if (rigidBodyComponent) {

                    // We need to rotate the vector ourselves
                    var v1 = new THREE.Vector3();
                    v1.copy(inputVector)
                        .applyEuler(new THREE.Euler(0, IbUtils.vecToEuler(multiCamComponent.thirdPersonPosition) + Math.PI / 2, 0));
                    v1.multiplyScalar(speedComponent.acceleration);

                    var currentVel = rigidBodyComponent.rigidBody.getLinearVelocity();
                    currentVel = currentVel.toTHREEVector3();

                    if (this.jump && this.canJump && currentVel.y < 1 && this.jumpTimer > minimumJumpDelay) {
                        this.jumpTimer = 0.0;
                        btVec3.setValue(0, 5, 0);
                        rigidBodyComponent.rigidBody.applyCentralImpulse(btVec3);
                    }

                    currentVel.y = 0;
                    if (currentVel.lengthSq() < speedComponent.maxSpeed * speedComponent.maxSpeed) {
                        btVec3.setValue(v1.x, 0, v1.z);
                        rigidBodyComponent.rigidBody.applyCentralImpulse(btVec3);
                    }

                    // Add a little bit custom friction for finetuning
                    var invertedVelocity = currentVel.clone().multiplyScalar(-0.2);
                    btVec3.setValue(invertedVelocity.x, 0, invertedVelocity.z);
                    rigidBodyComponent.rigidBody.applyCentralImpulse(btVec3);



                    if (inputVector.lengthSq() > 0.01) {
                        this.entity.rotation.y = IbUtils.vecToEuler(currentVel) - Math.PI / 2;
                    }

                    // Experimental...
                    // rigidBodyComponent.rigidBody.applyCentralForce(btVec3);
                    // rigidBodyComponent.rigidBody.setLinearVelocity(btVec3);
                } else {
                    this.entity.translateOnAxis(inputVector, speedComponent.acceleration * dt);
                }


                if (multiCamComponent) {
                    if (this.rotateLeft || this.rotateRight) {
                        multiCamComponent.temporarilyDisableAutoCameraCorrection = true;
                    }

                    if (this.rotateLeft) {
                        multiCamComponent.thirdPersonPosition.applyEuler(new THREE.Euler(0, speedComponent.rotateSpeed * dt, 0));
                    }
                    if (this.rotateRight) {
                        multiCamComponent.thirdPersonPosition.applyEuler(new THREE.Euler(0, -speedComponent.rotateSpeed * dt, 0));
                    }
                }



            };

            ScriptBank.add('/scripts/built-in/character-controller.js', CharacterControllerScript);
        }
    ]);
