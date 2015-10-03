angular
    .module('game.itemBehaviors.healthRegen', [
        'game.itemBehaviors.baseItemBehavior'
    ])
    .factory('HealthRegenItemBehavior', [
        'BaseItemBehavior',
        function(BaseItemBehavior) {
            'use strict';

            class HealthRegenItemBehavior extends BaseItemBehavior {

                constructor(strength) {
                    super();

                    this._strength = strength;

                    this._config = {};

                    if (angular.lowercase(strength) === 'weak') {
                        this._config = {
                            rate: 10.0,
                            amount: 0.25
                        };
                    }

                    if (angular.lowercase(strength) === 'normal') {
                        this._config = {
                            rate: 8.0,
                            amount: 0.5
                        };
                    }

                    if (angular.lowercase(strength) === 'strong') {
                        this._config = {
                            rate: 4.0,
                            amount: 0.75
                        };
                    }

                    if (angular.lowercase(strength) === 'epic') {
                        this._config = {
                            rate: 2.0,
                            amount: 1
                        };
                    }

                    if (angular.lowercase(strength) === 'legendary') {
                        this._config = {
                            rate: 0.25,
                            amount: 1.0
                        };
                    }
                }

                onEquip(item, entity) {
                    console.log('onEquip', item.name);
                    // TODO: check if already has from something else, and then what?

                    entity.addComponent('healthRegen', this._config);

                    return true;
                }

                onUnEquip(item, entity) {
                    console.log('onUnEquip', item.name);

                    entity.removeComponent('healthRegen');

                    return true;
                }
            }

            return HealthRegenItemBehavior;
        }
    ]);
