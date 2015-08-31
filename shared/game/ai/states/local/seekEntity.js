angular
    .module('game.ai.states.local')
    .factory('SeekEntity', function(Class, THREE, IbUtils, Patrol, BaseState, $rootWorld) {
            'use strict';

            return BaseState.extend({
                init: function(entity, config, world) {
                    this._super.apply(this, arguments);

                    this.findPathTimeoutTimer = 0.0;
                },
                findPathToEntity: function (targetEntity) {
                    this.calculatedPath = Patrol.findPath(this.entity.position.clone().add(new THREE.Vector3(0, -0.5, 0)),
                        targetEntity.position.clone().add(new THREE.Vector3(0, -0.5, 0)), this.entity.level, this.navMeshGroup);

                    debug.drawPath(this.entity.uuid + 'seekEntity', this.calculatedPath);
                },
                update: function(dTime) {
                    this._super.apply(this, arguments);

                    if (!this.targetEntity) {
                        this.targetEntity = this.world.scene.getObjectByProperty('uuid', this.targetEntityUuid);;
                        return;
                    }

                    this.findPathTimeoutTimer -= dTime;
                    if (this.findPathTimeoutTimer <= 0) {
                        this.findPathToEntity(this.targetEntity);

                        this.findPathTimeoutTimer = 1.0;
                    }

                    if (this.calculatedPath && this.calculatedPath.length > 1) {
                        if (this.calculatedPath[0].distanceToSquared(this.entity.position) > 1 * 1) {
                            this.steeringBehaviour.seek(this.calculatedPath[0]);
                        }
                        else {
                            // Remove node from the path we calculated
                            this.calculatedPath.shift();
                        }
                    }
                    else if (this.entity.position.distanceToSquared(this.targetEntity.position) > 1.2 * 1.2) {
                        this.steeringBehaviour.arrive(this.targetEntity.position);
                    }
                    else {
                        // Stop!
                        this.steeringBehaviour.brake(1.0);
                    }
                },
                destroy: function() {

                },
                handleMessage: function(message, data) {

                }
            });
        }
    )
