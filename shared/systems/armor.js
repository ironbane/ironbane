angular
    .module('systems.armor', [
        'ces',
        'engine.timing'
    ])
    .factory('ArmorSystem', [
        '$log',
        'System',
        'Timer',
        function($log, System, Timer) {
            'use strict';

            var ArmorSystem = System.extend({
                addedToWorld: function(world) {
                    this._super(world);

                    var inventorySystem = world.getSystem('inventory');

                    var buildArmor = function(entity) {

                        var totalArmor = 0;
                        inventorySystem.loopItems(entity, function (item, slot) {
                            if (item.armor) {
                                totalArmor += item.armor;
                            }
                        }, 'equipment');

                        if (!entity.hasComponent('armor')) {
                            entity.addComponent('armor', {
                                value: 0,
                                max: totalArmor
                            });
                        }
                        else {
                            entity.getComponent('armor').max = totalArmor;
                        }

                    };

                    world.subscribe('inventory:equipItem', buildArmor);
                    world.subscribe('inventory:load', buildArmor);

                    world.entityAdded('armorRegen').add(function(entity) {
                        var regen = entity.getComponent('armorRegen');
                        regen._regenTimer = new Timer(regen.rate);
                        regen._regenTimer.pause(); // start paused because we only regen when we need to
                    });
                },
                update: function() {
                    var entities = this.world.getEntities('armorRegen', 'armor');

                    entities.forEach(function(entity) {
                        var armor = entity.getComponent('armor'),
                            regen = entity.getComponent('armorRegen');

                        if (armor.value < armor.max) {
                            if (regen._regenTimer.isPaused) {
                                regen._regenTimer.unpause(); // will check again next tick
                            } else if (regen._regenTimer.isExpired) {
                                armor.value += regen.amount;
                                if (armor.value > armor.max) {
                                    armor.value = armor.max;
                                }

                                if (armor.value < armor.max) {
                                    regen._regenTimer.reset();
                                } else {
                                    regen._regenTimer.reset();
                                    regen._regenTimer.pause();
                                }
                            }
                        }
                    });
                }
            });

            return ArmorSystem;
        }
    ]);
