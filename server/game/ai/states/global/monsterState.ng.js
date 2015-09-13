angular
    .module('game.ai.states.global')
    .factory('MonsterState', function(Class, THREE, IbUtils, Patrol, $components) {
            'use strict';

            // We're going for a system where the client executes all of the code
            // regarding monster movement. The server only knows the monster's position and targetPosition
            // yet decides what the monster is going to do. In other words, the server is the "brains" of the monster.
            // We just tell the client the state of the monster and trust the client to take care of the rest.
            // Prone to cheating but in a co-op environment this should be managable. The big advantage is speed.

            var DEFAULT_AGGRO_RADIUS = 10;
            var DEFAULT_WANDER_WAYPOINT_CHANGE_TIMEOUT = 7.5;
            var DEFAULT_WANDER_RANGE = 10.0;

            return Class.extend({
                init: function(entity, config, world) {
                    this.entity = entity;
                    this.config = config;
                    this.world = world;

                    this.spawnPosition = entity.position.clone();

                    this.targetPosition = new THREE.Vector3();
                    this.wanderWaypointChangeTimer = 0.0;

                    this.lastFollowingEntity = null;

                    this.timeAlive = 0.0;

                    var me = this;

                },
                update: function(dTime) {
                    this.wanderWaypointChangeTimer -= dTime;
                    this.timeAlive += dTime;

                    var me = this;

                    var fighterComponent = this.entity.getComponent('fighter');

                    var fighterEntities = this.world.getEntities('fighter', 'health')
                        .filter(function (entity) {
                            var otherFighterComponent = entity.getComponent('fighter');
                            if (fighterComponent.faction === otherFighterComponent.faction) return false;

                            var otherHealthComponent = entity.getComponent('health');
                            if (otherHealthComponent.value <= 0) return false;

                            var otherDamagableComponent = entity.getComponent('damageable');

                            if (otherDamagableComponent) {
                                if (!otherDamagableComponent.spawnGuardTimer.isExpired) {
                                    return false;
                                }
                            }

                            return entity.position.distanceToSquared(me.entity.position) < Math.pow((me.aggroRadius || DEFAULT_AGGRO_RADIUS) + (me.wanderRange || DEFAULT_WANDER_RANGE), 2)
                        });

                    // Find nearest hostile target
                    fighterEntities.sort(function(a, b) {
                        return a.position.distanceToSquared(me.entity.position) - b.position.distanceToSquared(me.entity.position);
                    });

                    var foundTarget = null;
                    if (fighterEntities.length) {
                        foundTarget = fighterEntities[0];
                    }


                    if (this.lastFollowingEntity !== foundTarget && foundTarget) {
                        // If a target is already present while we spawn, there's a bug where the cadd/remove emits
                        // aren't coming across for some reason (perhaps because it's too soon, before the onComponentAdd handlers are added?).
                        // Only try after we've been alive for a short while
                        if (this.timeAlive > 1.0) {
                            this.lastFollowingEntity = foundTarget;

                            if (this.entity.hasComponent('localState')) {
                                this.entity.removeComponent('localState');
                            }

                            this.entity.addComponent($components.get('localState', {
                                state: 'searchAndDestroyEntity',
                                config: {
                                    targetEntityUuid: this.lastFollowingEntity.uuid
                                }
                            }));
                        }
                    }

                    if (this.lastFollowingEntity) {
                        // Stop pursuing if they are no longer in our target list
                        if (!_.contains(fighterEntities, this.lastFollowingEntity)) {
                            if (this.entity.hasComponent('localState')) {
                                this.entity.removeComponent('localState');
                            }
                            this.lastFollowingEntity = null;
                        }
                    }

                    if (!foundTarget) {

                        if (this.wanderWaypointChangeTimer < 0) {
                            this.wanderWaypointChangeTimer = this.wanderWaypointChangeTimeout || DEFAULT_WANDER_WAYPOINT_CHANGE_TIMEOUT;

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