angular
    .module('game.ai.states.global')
    .factory('MonsterState', function(Class, THREE, IbUtils, Patrol, $components) {
            'use strict';

            // We're going for a system where the client executes all of the code
            // regarding monster movement. The server only knows the monster's position and targetPosition
            // yet decides what the monster is going to do. In other words, the server is the "brains" of the monster.
            // We just tell the client the state of the monster and trust the client to take care of the rest.
            // Prone to cheating but in a co-op environment this should be managable. The big advantage is speed.

            var DEFAULT_SPAWN_RADIUS = 10;
            var DEFAULT_WANDER_WAYPOINT_CHANGE_TIMEOUT = 7.5;

            return Class.extend({
                init: function(entity, config, world) {
                    this.entity = entity;
                    this.config = config;
                    this.world = world;

                    this.spawnPosition = entity.position.clone();

                    this.targetPosition = new THREE.Vector3();
                    this.wanderWaypointChangeTimer = 0.0;

                    this.lastFollowingEntity = null;

                    var me = this;

                    var checkForNavMeshGroup = function () {
                        me.navMeshGroup = Patrol.getGroup(entity.level, entity.position.clone().add(new THREE.Vector3(0, -0.5, 0)));
                        if (me.navMeshGroup === null) {
                            setTimeout(checkForNavMeshGroup, 100);
                        }
                    };
                    checkForNavMeshGroup();

                    // setInterval(function () {
                    //     var players = world.getEntities('player');
                    //     console.log('active players')
                    //     players.forEach(function (player) {
                    //         console.log(player.uuid);
                    //     });
                    // }, 500);

                },
                update: function(dTime) {
                    this.wanderWaypointChangeTimer -= dTime;

                    var me = this;

                    var players = this.world.getEntities('player')
                        .filter(function (player) {
                            return player.position.distanceToSquared(me.entity.position) < Math.pow(me.spawnRadius || DEFAULT_SPAWN_RADIUS, 2)
                        });

                    // Follow nearest player
                    players.sort(function(a, b) {
                        return a.position.distanceToSquared(me.entity.position) - b.position.distanceToSquared(me.entity.position);
                    });

                    var foundTarget = null;
                    if (players.length) {
                        foundTarget = players[0];
                    }


                    if (this.lastFollowingEntity !== foundTarget && foundTarget) {
                        this.lastFollowingEntity = foundTarget;

                        if (this.entity.hasComponent('localState')) {
                            this.entity.removeComponent('localState');
                        }

                        this.entity.addComponent($components.get('localState', {
                            state: 'seekEntity',
                            config: {
                                targetEntityUuid: this.lastFollowingEntity.uuid
                            }
                        }));
                    }

                    if (this.lastFollowingEntity) {
                        // Stop pursuing if they get too far away
                        if (this.lastFollowingEntity.position.distanceToSquared(me.entity.position) > Math.pow(me.spawnRadius || DEFAULT_SPAWN_RADIUS, 2)) {
                            if (this.entity.hasComponent('localState')) {
                                this.entity.removeComponent('localState');
                            }
                        }
                    }

                    if (!foundTarget) {

                        if (this.entity.hasComponent('localState')) {
                            this.entity.removeComponent('localState');
                        }

                        if (this.wanderWaypointChangeTimer < 0) {
                            this.wanderWaypointChangeTimer = this.wanderWaypointChangeTimeout || DEFAULT_WANDER_WAYPOINT_CHANGE_TIMEOUT;

                            var targetPosition = Patrol.getRandomNode(this.entity.level, this.navMeshGroup, this.spawnPosition, 10);

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
        }
    )