angular
    .module('game.scripts.character-controller', [
        'components.script',
        'three',
        'ammo',
        'game.game-socket' // passing this in here may not be the best way...
    ])
    .run(function ($log, ScriptBank, THREE, Ammo, $gameSocket) {
        'use strict';

        var acceleration = 0.7;
        var rotateSpeed = 2;
        var maxspeed = 4;

        // The amount of time that must pass before you can jump again
        var minimumJumpDelay = 0.4;

        var btVec3 = new Ammo.btVector3();

        var CharacterControllerScript = function (entity, world) {
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
                collisionReporterComponent.collisionStart.add(function (contact) {
                    me.activeCollisions.push(contact);
                });
                collisionReporterComponent.collisionEnd.add(function (contact) {
                    me.activeCollisions.splice(me.activeCollisions.indexOf(contact), 1);
                });
            }
        };

        CharacterControllerScript.prototype.update = function (dt, elapsed, timestamp) {

            debug.watch('player.position', this.entity.position);

            var input = this.world.getSystem('input'), // should cache this during init?
                leftStick = input.virtualGamepad.leftThumbstick,
                rightStick = input.virtualGamepad.rightThumbstick;

            var me = this;

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

            var rigidBodyComponent = me.entity.getComponent('rigidBody');

            if (rigidBodyComponent) {
                // We only set a friction when the character is on the ground, to prevent
                // side-friction from allowing character to stop in midair
                // First reset the friction here
                rigidBodyComponent.rigidBody.setFriction(0.7);
            }

            var scenes = this.world.getEntities('scene');


            // TODO cache raycasts, this needs to raycast again which could actually use the one
            // used from the shadow. Perhaps a raycastmanager of some sort is needed.

            // Reset just to be sure
            this.canJump = false;

            if (scenes.length) {
                var octree = scenes[0].octree;

                var ray = new THREE.Raycaster(this.entity.position, new THREE.Vector3(0, -1, 0));

                var intersections = ray.intersectOctreeObjects(octree.objects);

                if (intersections.length) {
                    if (intersections[0].distance <= 0.55) {
                        // We can jump when the ray distance is less than 0.5, since the player pos is at 0.5 and is 1 in height.
                        // Add 0.05 to take into account slopes, which have a small offset when casting rays downwards = 0.55
                        this.canJump = true;
                    }
                    else {
                        // Get rid of friction so we don't slow down on the walls while falling
                        rigidBodyComponent.rigidBody.setFriction(0.0);
                    }
                }
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

            // keyboard controls
            if (input.keyboard.isDown(input.KEYS.W) || input.keyboard.isDown(input.KEYS.UP)) {
                this.moveForward = true;
            }

            if (input.keyboard.isDown(input.KEYS.S) || input.keyboard.isDown(input.KEYS.DOWN)) {
                this.moveBackward = true;
            }

            if (input.keyboard.isDown(input.KEYS.A) || input.keyboard.isDown(input.KEYS.LEFT)) {
                this.rotateLeft = true;
            }

            if (input.keyboard.isDown(input.KEYS.D) || input.keyboard.isDown(input.KEYS.RIGHT)) {
                this.rotateRight = true;
            }

            if (input.keyboard.isDown(input.KEYS.Q)) {
                this.moveLeft = true;
            }

            if (input.keyboard.isDown(input.KEYS.E)) {
                this.moveRight = true;
            }

            if (input.keyboard.isDown(input.KEYS.SPACE)) {
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

            // Make sure they can't gain extra speed if moving diagonally
            inputVector.normalize();

            if (rigidBodyComponent) {

                // We need to rotate the vector ourselves
                var v1 = new THREE.Vector3();
                v1.copy(inputVector).applyQuaternion(this.entity.quaternion);
                v1.multiplyScalar(acceleration);

                var currentVel = rigidBodyComponent.rigidBody.getLinearVelocity();
                currentVel = currentVel.toTHREEVector3();

                if (this.jump && this.canJump && currentVel.y < 1 && this.jumpTimer > minimumJumpDelay) {
                    this.jumpTimer = 0.0;
                    btVec3.setValue(0, 5, 0);
                    rigidBodyComponent.rigidBody.applyCentralImpulse(btVec3);
                }

                currentVel.y = 0;
                if (currentVel.lengthSq() < maxspeed * maxspeed) {
                    btVec3.setValue(v1.x, 0, v1.z);
                    rigidBodyComponent.rigidBody.applyCentralImpulse(btVec3);
                }

                // Add a little bit custom friction for finetuning
                var invertedVelocity = currentVel.clone().multiplyScalar(-0.2);
                btVec3.setValue(invertedVelocity.x, 0, invertedVelocity.z);
                rigidBodyComponent.rigidBody.applyCentralImpulse(btVec3);

                // Experimental...
                // rigidBodyComponent.rigidBody.applyCentralForce(btVec3);
                // rigidBodyComponent.rigidBody.setLinearVelocity(btVec3);
            } else {
                this.entity.translateOnAxis(inputVector, acceleration * dt);
            }

            if (this.rotateLeft) {
                this.entity.rotateY(rotateSpeed * dt);
            }
            if (this.rotateRight) {
                this.entity.rotateY(-rotateSpeed * dt);
            }

            // prolly needs a perf tweak..
            $gameSocket.emit('movement', {position: this.entity.position.toArray(), rotation: this.entity.rotation.toArray()});
        };

        ScriptBank.add('/scripts/built-in/character-controller.js', CharacterControllerScript);
    });
