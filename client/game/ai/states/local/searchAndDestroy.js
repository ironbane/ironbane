angular
    .module('game.ai.states.local')
    .factory('SearchAndDestroyEntity', ["Class", "THREE", "IbUtils", "Patrol", "BaseState", "Timer", "$rootWorld", function(Class, THREE, IbUtils, Patrol, BaseState, Timer, $rootWorld) {
            'use strict';

            return BaseState.extend({
                init: function(entity, config, world) {
                    this._super.apply(this, arguments);

                    this.attackRange = 0;

                    var inventoryComponent = this.entity.getComponent('inventory');
                    if (inventoryComponent) {
                        if (inventoryComponent.rhand && inventoryComponent.rhand.type === 'weapon') {
                            this.attackRange = inventoryComponent.rhand.range;
                        }
                        if (inventoryComponent.lhand && inventoryComponent.lhand.type === 'weapon') {
                            if (inventoryComponent.lhand.range > this.attackRange) {
                                this.attackRange = inventoryComponent.lhand.range;
                            }
                        }
                    }

                    this.strafeTimer = new Timer(2.0);
                    this.jumpTimer = new Timer(2.0);
                    this.isStrafing = false;

                    this.originalSpeed = this.steeringBehaviour.speed;

                    this.randomStrafeTarget = new THREE.Vector3();
                },
                update: function(dTime) {
                    this._super.apply(this, arguments);

                    if (!this.targetEntity) {
                        this.targetEntity = this.world.scene.getObjectByProperty('uuid', this.targetEntityUuid);;
                    }
                    else {

                        if (this.monsterBehaviour['Random Strafing']) {
                            if (this.strafeTimer.isExpired ||
                                this.entity.position.inRangeOf(this.randomStrafeTarget, 1.0)) {
                                this.isStrafing = !this.isStrafing;
                                this.strafeTimer.set(IbUtils.getRandomFloat(0.2, 0.5));
                                this.strafeTimer.reset();

                                var offset;

                                if (this.entity.position.inRangeOf(this.targetEntity.position, 5.0)) {
                                    var toTarget = this.targetEntity.position.clone().sub(this.entity.position);
                                    var up = new THREE.Vector3(0, 1, 0);
                                    offset = toTarget.clone().cross(up);
                                    offset.normalize().multiplyScalar(toTarget.length() * 2);
                                    if (IbUtils.getRandomInt(0, 1) === 1) {
                                        offset.multiplyScalar(-1);
                                    }
                                }
                                else {
                                    offset = IbUtils.getRandomVector3(new THREE.Vector3(), new THREE.Vector3(10, 0, 10));
                                }

                                this.randomStrafeTarget.copy(this.entity.position.clone().add(offset));
                            }
                        }

                        if (this.monsterBehaviour['Jumps A Lot']) {
                            if (this.jumpTimer.isExpired) {
                                this.jumpTimer.set(IbUtils.getRandomFloat(2.0, 8.0));
                                this.jumpTimer.reset();

                                this.world.publish('fighter:jump', this.entity);
                            }
                        }

                        if (this.monsterBehaviour['Random Strafing'] && this.isStrafing) {
                            this.steeringBehaviour.speed = this.originalSpeed * 1.25;
                            this.steeringBehaviour.seek(this.randomStrafeTarget);
                        }
                        else if (!this.entity.position.inRangeOf(this.targetEntity.position, 1.2)) {
                            this.steeringBehaviour.speed = this.originalSpeed;
                            this.steeringBehaviour.seek(this.targetEntity.position);
                        }
                        else {
                            this.steeringBehaviour.brake(1.0);
                        }

                    }

                    var fighterComponent = this.entity.getComponent('fighter');

                    if (fighterComponent) {
                        if (this.targetEntity) {
                            var toTarget = this.targetEntity.position.clone().sub(this.entity.position);

                            if (toTarget.lengthSq() <= this.attackRange * this.attackRange) {
                                var targetVector = this.entity.position.clone().add(toTarget);

                                fighterComponent.attack(targetVector, this.targetEntity);
                            }
                        }
                    }

                },
                destroy: function() {
                    this._super.apply(this, arguments);
                },
                handleMessage: function(message, data) {

                }
            });
        }]
    )
