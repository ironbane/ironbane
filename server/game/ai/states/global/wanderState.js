angular
    .module('game.ai.states.global')
    .factory('WanderState', ["Class", "THREE", "IbUtils", "$components", function(Class, THREE, IbUtils, $components) {
            'use strict';

            var DEFAULT_WANDER_WAYPOINT_CHANGE_TIMEOUT_MIN = 30;
            var DEFAULT_WANDER_WAYPOINT_CHANGE_TIMEOUT_MAX = 60;
            var DEFAULT_WANDER_RANGE = 40.0;

            return Class.extend({
                init: function(entity, config, world) {
                    this.entity = entity;
                    this.config = config;
                    this.world = world;

                    this.spawnPosition = entity.position.clone();

                    this.targetPosition = new THREE.Vector3();
                    this.wanderWaypointChangeTimer = 0.0;

                    this.timeAlive = 0.0;

                    var me = this;

                },
                update: function(dTime) {
                    this.wanderWaypointChangeTimer -= dTime;
                    this.timeAlive += dTime;

                    var me = this;

                    if (this.wanderWaypointChangeTimer < 0) {
                        this.wanderWaypointChangeTimer = IbUtils.getRandomInt(DEFAULT_WANDER_WAYPOINT_CHANGE_TIMEOUT_MIN, DEFAULT_WANDER_WAYPOINT_CHANGE_TIMEOUT_MAX);

                        var targetPosition = IbUtils.getRandomVector3(this.entity.position, new THREE.Vector3(this.wanderRange || DEFAULT_WANDER_RANGE, 0, this.wanderRange || DEFAULT_WANDER_RANGE));

                        // console.log(this.entity.name + ' changed position');
                        // console.log('position: ', this.entity.position);
                        // console.log('targetPosition: ', this.targetPosition);

                        if (this.entity.hasComponent('localState')) {
                            this.entity.removeComponent('localState');
                        }

                        this.entity.addComponent($components.get('localState', {
                            state: 'findPathToPosition',
                            config: {
                                targetPosition: targetPosition
                            }
                        }));
                    }


                },
                destroy: function() {

                },
                handleMessage: function(message, data) {

                    switch (message) {
                        case "attacked":


                            break;
                        case "stopChase":
                        case "respawned":


                            break;
                    }
                }
            });
        }]
    )