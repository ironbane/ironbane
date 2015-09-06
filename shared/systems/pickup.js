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
                update: function(dt, elapsed) {
                    var pickups = this.world.getEntities('pickup', 'quad');

                    pickups.forEach(function(entity) {
                        var pickupComponent = entity.getComponent('pickup');
                        var quadComponent = entity.getComponent('quad');
                        // animate hover
                        if (pickupComponent.hover) {
                            quadComponent.offsetPosition.y = pickupComponent.hover.amplitude * (Math.sin(elapsed * pickupComponent.hover.speed));
                        }
                    });
                }
            });

            return PickupSystem;
        }
    ]);
