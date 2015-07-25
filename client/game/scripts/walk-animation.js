angular
    .module('game.scripts.walk-animation', [
        'engine.scriptBank',
        'three'
    ])
    .run([
        'ScriptBank',
        'THREE',
        function(ScriptBank, THREE) {
            'use strict';

            var getDirectionSpriteIndex = function(entity, world) {
                var entitiesWithCamera = world.getEntities('camera');

                var index = 0;

                if (entitiesWithCamera.length) {
                    var activeCamera = entitiesWithCamera[0].getComponent('camera')._camera;

                    var camWorldPos = new THREE.Vector3();
                    camWorldPos.setFromMatrixPosition(activeCamera.matrixWorld);
                    var directionVec = camWorldPos;
                    directionVec.sub(entity.position);

                    var rotVec = new THREE.Vector3(0, 0, 1);
                    rotVec.applyEuler(entity.rotation);

                    var rotY = (Math.atan2(rotVec.z, rotVec.x));
                    if (rotY < 0) {
                        rotY += (Math.PI * 2);
                    }
                    rotY = (Math.PI * 2) - rotY;

                    // Rotate vector with our own rotation
                    var tx = ((directionVec.x * Math.cos(rotY)) - (directionVec.z * Math.sin(rotY)));
                    var tz = ((directionVec.x * Math.sin(rotY)) + (directionVec.z * Math.cos(rotY)));

                    directionVec.x = tx;
                    directionVec.z = tz;

                    var result = Math.atan2(directionVec.z, directionVec.x);

                    result += Math.PI;

                    while (result < 0) {
                        result += (Math.PI * 2);
                    }
                    while (result > (Math.PI * 2)) {
                        result -= (Math.PI * 2);
                    }

                    if (result >= 0.39 && result <= 1.17) {
                        index = 3;
                    } else if (result > 1.17 && result <= 1.96) {
                        index = 2;
                    } else if (result > 1.96 && result <= 2.74) {
                        index = 1;
                    } else if (result > 2.74 && result <= 3.53) {
                        index = 0;
                    } else if (result > 3.53 && result <= 4.31) {
                        index = 7;
                    } else if (result > 4.31 && result <= 5.10) {
                        index = 6;
                    } else if (result > 5.10 && result <= 5.89) {
                        index = 5;
                    } else {
                        index = 4;
                    }
                }

                return index;
            };


            var WalkAnimationScript = function(entity, world) {
                this.entity = entity;
                this.world = world;

                this.walkTimer = 0.0;
                this.walkIndex = 1;
                this.walkForward = true;
                this.dirIndex = 0;
            };

            WalkAnimationScript.prototype.update = function(dt, elapsed, timestamp) {
                // this script should be attached to an entity with a camera component....
                var quadComponent = this.entity.getComponent('quad');

                if (quadComponent) {
                    var quad = quadComponent._quad;

                    this.dirIndex = getDirectionSpriteIndex(this.entity, this.world);

                    var rigidBodyComponent = this.entity.getComponent('rigidBody');

                    if (rigidBodyComponent) {
                        var currentVel = rigidBodyComponent.rigidBody.getLinearVelocity();
                        currentVel = currentVel.toTHREEVector3();

                        var speed = currentVel.lengthSq();
                        var stepFactor = speed / 10;

                        stepFactor = Math.min(stepFactor, 1.0);
                        stepFactor = 1.0 - stepFactor;
                        stepFactor = Math.max(stepFactor, 0.1);

                        if (speed > 0.1) {
                            this.walkTimer += dt;
                        } else {
                            this.walkIndex = 1;
                        }

                        if (this.walkTimer > stepFactor) {
                            this.walkTimer = 0;
                            if (this.walkForward) {
                                this.walkIndex++;
                            } else {
                                this.walkIndex--;
                            }

                            if (this.walkIndex !== 1) {
                                this.walkForward = !this.walkForward;
                            }
                        }
                    }

                    quadComponent.indexH = this.walkIndex;
                    quadComponent.indexV = this.dirIndex;
                    quadComponent.numberOfSpritesH = 3;
                    quadComponent.numberOfSpritesV = 8;
                }

            };

            ScriptBank.add('/scripts/built-in/walk-animation.js', WalkAnimationScript);
        }
    ]);
