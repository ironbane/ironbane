angular
    .module('game.scripts.character-controller', [
        'engine.scriptBank',
        'three',
        'ammo',
        'engine.debugger',
        'engine.util',
        'game.clientSettings',
        'game.ui.bigMessages.bigMessagesService',
        'global.constants.inv'
    ])
    .run([
        '$log',
        'ScriptBank',
        'THREE',
        'Ammo',
        'Debugger',
        'IbUtils',
        '$clientSettings',
        'BigMessagesService',
        'INV_SLOTS',
        function($log, ScriptBank, THREE, Ammo, Debugger, IbUtils, $clientSettings, BigMessagesService, INV_SLOTS) {
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

                // this might belong somewhere else...
                var input = this.world.getSystem('input');

                var playMap = input.getActionMap('play');
                playMap.map('jump', 'gamepad', 'XBOX360_A');
                playMap.map('jump', 'keyboard', 'SPACE');

                playMap.map('attack', 'gamepad', 'XBOX360_RIGHT_TRIGGER', 'D');
                playMap.map('attack', 'keyboard', 'F', 'D');
                playMap.map('attack', 'mouse', 'MOUSE_BUTTON_LEFT', 'D');

                playMap.map('moveForward', 'keyboard', 'W', 'D');
                playMap.map('moveForward', 'keyboard', 'UP', 'D');
                playMap.map('moveForward', 'gamepad', 'XBOX360_STICK_LEFT_Y', 'A-');

                playMap.map('moveBackward', 'keyboard', 'S', 'D');
                playMap.map('moveBackward', 'keyboard', 'DOWN', 'D');
                playMap.map('moveBackward', 'gamepad', 'XBOX360_STICK_LEFT_Y', 'A+');

                playMap.map('moveLeft', 'keyboard', 'A', 'D');
                playMap.map('moveLeft', 'keyboard', 'LEFT', 'D');
                playMap.map('moveLeft', 'gamepad', 'XBOX360_STICK_LEFT_X', 'A-');

                playMap.map('moveRight', 'keyboard', 'D', 'D');
                playMap.map('moveRight', 'keyboard', 'RIGHT', 'D');
                playMap.map('moveRight', 'gamepad', 'XBOX360_STICK_LEFT_X', 'A+');

                playMap.map('rotateLeft', 'keyboard', 'Q', 'D');
                playMap.map('rotateLeft', 'gamepad', 'XBOX360_LEFT_BUMPER', 'D');

                playMap.map('rotateRight', 'keyboard', 'E', 'D');
                playMap.map('rotateRight', 'gamepad', 'XBOX360_RIGHT_BUMPER', 'D');

                playMap.map('changeCamera', 'keyboard', 'C', 'P');
                // TODO add Xbox control for changeCamera

                for (var i = 1; i <= 8; i++) {
                    playMap.map('hotKey' + i, 'keyboard', i, 'P');
                }
                playMap.map('hotKeySecondRowToggle', 'keyboard', 'SHIFT', 'D');


                this.primaryAttackHandler = function() {
                    var targetVector,
                        mouseHelper = entity.getComponent('mouseHelper');

                    if (mouseHelper) { // TODO: if no mouseHelper, shoot straight from direction facing
                        var toTarget = mouseHelper.target.clone().sub(entity.position);

                        // Check if we're attacking within our field of vision
                        // var dot = toTarget.dot(new THREE.Vector3(0, 0, 1).applyQuaternion(entity.quaternion));

                        // if (dot < 0) {
                            if (toTarget.lengthSq() > mouseHelper.range * mouseHelper.range) {
                                toTarget.normalize().multiplyScalar(mouseHelper.range);
                            }

                            targetVector = entity.position.clone().add(toTarget);
                        // }

                        // Rotate the player towards the attack direction
                        entity.rotation.y = IbUtils.vecToEuler(toTarget) - Math.PI / 2;
                    }

                    if (targetVector) {
                        world.publish('combat:primaryAttack', entity, targetVector);
                    }
                };
            };

            CharacterControllerScript.prototype.update = function(dt, elapsed, timestamp) {

                if ($clientSettings.get('isAdminPanelOpen')) {
                    return;
                }

                var input = this.world.getSystem('input'), // should cache this during init?
                    leftStick = input.virtualGamepad.leftThumbstick,
                    rightStick = input.virtualGamepad.rightThumbstick,
                    playMap = input.getActionMap('play');

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
                    });
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

                this.moveForward = playMap.test('moveForward');
                this.moveBackward = playMap.test('moveBackward');
                this.moveLeft = playMap.test('moveLeft');
                this.moveRight = playMap.test('moveRight');
                this.rotateRight = playMap.test('rotateRight');
                this.rotateLeft = playMap.test('rotateLeft');
                this.jump = playMap.test('jump');

                if (playMap.test('attack')) {
                    this.primaryAttackHandler();
                }

                var multiCamComponent = this.entity.getScript('/scripts/built-in/character-multicam.js');

                if (multiCamComponent.cameraType === 'classic') {
                    var tml = this.moveLeft;
                    var tmr = this.moveRight;
                    this.moveLeft = this.rotateLeft;
                    this.moveRight = this.rotateRight;
                    this.rotateLeft = tml;
                    this.rotateRight = tmr;
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

                // Make sure they can't gain extra speed if moving diagonally
                inputVector.normalize();

                if (playMap.test('attack')) {
                    multiCamComponent.temporarilyDisableAutoCameraCorrection = true;
                }
                else if (inputVector.lengthSq() > 0.01) {
                    multiCamComponent.temporarilyDisableAutoCameraCorrection = false;
                }

                if (playMap.test('changeCamera')) {
                    multiCamComponent.changeCamera();
                    BigMessagesService.add('Camera: ' + multiCamComponent.cameraType);
                }

                var inventorySystem = this.world.getSystem('inventory');
                var inventoryComponent = this.entity.getComponent('inventory');

                if (inventoryComponent) {
                    for (var i = 0; i <= 7; i++) {
                        if (playMap.test('hotKeySecondRowToggle') && playMap.test('hotKey' + (i+1))) {
                            // if (inventoryComponent[INV_SLOTS.armorList[i]]) {
                            //     inventorySystem.useItem(this.entity, inventoryComponent[INV_SLOTS.armorList[i]]);
                            // }
                        }
                        else if (playMap.test('hotKey' + (i+1))) {
                            if (inventoryComponent['slot' + i]) {
                                inventorySystem.useItem(this.entity, inventoryComponent['slot' + i]);
                            }
                        }
                    }
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
                        this.world.publish('fighter:jump', this.entity);
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



                    if (inputVector.lengthSq() > 0.01 && !playMap.test('attack')) {
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

                    if (multiCamComponent.cameraType === 'classic') {
                        if (this.rotateLeft) {
                            this.entity.rotation.y += speedComponent.rotateSpeed * dt;
                        }
                        if (this.rotateRight) {
                            this.entity.rotation.y -= speedComponent.rotateSpeed * dt;
                        }
                    }
                }



            };

            ScriptBank.add('/scripts/built-in/character-controller.js', CharacterControllerScript);
        }
    ]);
