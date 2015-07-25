angular
    .module('systems.fighter', [
        'ces',
        'game.ai.states'
    ])
    .factory('FighterSystem', function($log, System, States) {
            'use strict';

            return System.extend({
                addedToWorld: function(world) {
                    this._super(world);


                    world.entityAdded('fighter').add(function(entity) {
                        var fighterComponent = entity.getComponent('fighter');

                        fighterComponent.attack = function (target) {
                            var wieldItemComponent = entity.getComponent('wieldItem');

                            if (wieldItemComponent) {
                                wieldItemComponent.doAttackAnimation();

                                // Throw the weapon
                            }
                            else {
                                // Dash like before
                            }
                        };
                    });

                },
                update: function(dTime) {
                    var me = this;

                    var fighterEntities = me.world.getEntities('fighter');

                    fighterEntities.forEach(function(entity) {
                        var fighterComponent = entity.getComponent('fighter');

                        if (fighterComponent) {

                        }
                    });

                }
            });
        }
    );
