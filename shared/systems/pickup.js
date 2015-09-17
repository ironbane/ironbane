angular
    .module('systems.pickup', [
        'ces.entityProcessingSystem'
    ])
    .factory('PickupSystem', [
        'EntityProcessingSystem',
        function(EntityProcessingSystem) {
            'use strict';

            var PickupSystem = EntityProcessingSystem.extend({
                init: function() {
                    this._super('pickup', 'quad');
                },
                updateEntity: function(timing, entity) {
                    var pickupComponent = entity.getComponent('pickup'),
                        quadComponent = entity.getComponent('quad');

                    // animate hover
                    if (pickupComponent.hover) {
                        quadComponent.offsetPosition.y = pickupComponent.hover.amplitude * (Math.sin(timing.elapsed * pickupComponent.hover.speed));
                    }
                }
            });

            return PickupSystem;
        }
    ]);
