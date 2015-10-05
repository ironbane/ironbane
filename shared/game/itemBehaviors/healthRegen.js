angular
    .module('game.itemBehaviors.healthRegen', [
        'game.itemBehaviors.baseItemBehavior',
        'global.constants.inv'
    ])
    .factory('HealthRegenItemBehavior', [
        'BaseItemBehavior',
        'INV_SLOTS',
        function(BaseItemBehavior, INV_SLOTS) {
            'use strict';

            var REGEN_STR = {
                weak: {
                    rate: 10.0,
                    amount: 0.25
                },
                normal: {
                    rate: 8.0,
                    amount: 0.5
                },
                strong: {
                    rate: 4.0,
                    amount: 0.75
                },
                epic: {
                    rate: 2.0,
                    amount: 1.0
                },
                legendary: {
                    rate: 0.25,
                    amount: 1.0
                }
            };

            class HealthRegenItemBehavior extends BaseItemBehavior {

                constructor(strength) {
                    super();

                    if (!strength) {
                        strength = 'normal';
                    }
                    this._strength = strength;

                    this._config = REGEN_STR[angular.lowercase(strength)];
                }

                onUse(item, entity) {
                    // use is from a consumable, so it's a "permanent" effect
                    this.onEquip(item, entity);
                    entity.getComponent('healthRegen')._permanent = true;

                    return true;
                }

                onEquip(item, entity) {
                    if (entity.hasComponent('healthRegen')) {
                        let regen = entity.getComponent('healthRegen');

                        if (regen.rate > this._config.rate) {
                            // if our rate is faster, most likely it's "better"
                            regen.rate = this._config.rate;
                            regen.amount = this._config.amount;
                        }
                        // otherwise we already have a better one, leave it
                    } else {
                        entity.addComponent('healthRegen', this._config);
                    }

                    return true;
                }

                onUnEquip(item, entity) {
                    let inv = entity.getComponent('inventory');
                    let others = [];
                    // check for any other HealthRegen behaviors, and keep the best one
                    INV_SLOTS.armorList.forEach(slot => {
                        if (inv[slot] && inv[slot].uuid !== item.uuid && inv[slot].behavior) {
                            inv[slot].behavior.forEach(function(b) {
                                var parts = b.split(' ');
                                if (parts[0] === 'HealthRegen') {
                                    others.push(REGEN_STR[angular.lowercase(parts[1].trim())]);
                                }
                            });
                        }
                    });

                    if (others.length === 0) {
                        if (entity.getComponent('healthRegen')._permanent !== true) {
                            entity.removeComponent('healthRegen');
                        }
                    } else {
                        let regen = entity.getComponent('healthRegen');
                        // temp set low rate so can find the best
                        regen.rate = 0;
                        others.forEach(other => {
                            if (other.rate > regen.rate) {
                                regen.rate = other.rate;
                                regen.amount = other.amount;
                            }
                        });
                    }

                    return true;
                }
            }

            return HealthRegenItemBehavior;
        }
    ]);
