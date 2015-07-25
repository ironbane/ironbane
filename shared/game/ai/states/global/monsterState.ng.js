angular
    .module('game.ai.states.global')
    .factory('MonsterState', function(Class, THREE, IbUtils) {
            'use strict';

            return Class.extend({
                init: function(entity) {
                    this.entity = entity;

                    this.targetPosition = new THREE.Vector3();
                    this.wanderWaypointChangeTimer = 0.0;
                },
                update: function(dTime) {
                    this.wanderWaypointChangeTimer -= dTime;

                    if (this.wanderWaypointChangeTimer < 0) {
                        this.wanderWaypointChangeTimer = 5.0;
                        this.targetPosition = new THREE.Vector3(IbUtils.getRandomFloat(-9, 9), 0.5, IbUtils.getRandomFloat(-9, 9))
                    }

                    this.entity.position.lerp(this.targetPosition, dTime);
                    // console.log(this.entity.position);
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
        }
    )
