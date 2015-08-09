angular
    .module('systems.pickup', [
        'ces',
        'three'
    ])
    .factory('PickupSystem', [
        '$log',
        'System',
        'THREE',
        function($log, System, THREE) {
            'use strict';

            var PickupSystem = System.extend({
                addedToWorld: function(world) {
                    this._super(world);

                    world.entityAdded('pickup').add(function(entity) {
                        var pickup = entity.getComponent('pickup');
                        // store original pos for hover
                        pickup._start = entity.position.clone();
                    });
                },
                update: function(dt, elapsed) {
                    var pickups = this.world.getEntities('pickup');

                    pickups.forEach(function(entity) {
                        var pickup = entity.getComponent('pickup');
                        // animate hover
                        if (pickup.hover) {
                            entity.position.y = pickup._start.y + (pickup.hover.amplitude * (Math.sin(elapsed * pickup.hover.speed)));
                        }
                    });
                }
            });

            return PickupSystem;
        }
    ]);
