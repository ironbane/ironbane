angular
    .module('systems.health', [
        'ces',
        'engine.timing'
    ])
    .factory('HealthSystem', [
        '$log',
        'System',
        'Timer',
        function($log, System, Timer) {
            'use strict';

            var HealthSystem = System.extend({
                addedToWorld: function(world) {
                    this._super(world);

                    world.entityAdded('healthRegen').add(function(entity) {
                        var regen = entity.getComponent('healthRegen');
                        regen._regenTimer = new Timer(regen.rate);
                        regen._regenTimer.pause(); // start paused because we only regen when we need to
                    });
                },
                update: function() {
                    var entities = this.world.getEntities('health');

                    var damageSystem = this.world.getSystem('damage');

                    entities.forEach(function(entity) {
                        var health = entity.getComponent('health'),
                            regen = entity.getComponent('healthRegen');

                        if (regen) {
                            if (health.value < health.max) {
                                if (regen._regenTimer.isPaused) {
                                    regen._regenTimer.unpause(); // will check again next tick
                                } else if (regen._regenTimer.isExpired) {
                                    health.value += regen.amount;

                                    damageSystem.addDamageParticles('healthRegen', regen.amount, entity.position);

                                    if (health.value < health.max) {
                                        regen._regenTimer.reset();
                                    } else {
                                        regen._regenTimer.reset();
                                        regen._regenTimer.pause();
                                    }
                                }
                            }
                        }

                        health.value = Math.min(health.value, health.max);
                    });
                }
            });

            return HealthSystem;
        }
    ]);
