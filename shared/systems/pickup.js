angular
    .module('systems.pickup', [
        'ces.entityProcessingSystem',
        'engine.timing'
    ])
    .factory('PickupSystem', [
        'EntityProcessingSystem',
        'Timer',
        function(EntityProcessingSystem, Timer) {
            'use strict';

            var PickupSystem = EntityProcessingSystem.extend({
                init: function() {
                    this._super('pickup', 'quad');
                },
                onEntityAdded: function(entity) {
                    var pickup = entity.getComponent('pickup');
                    pickup._lifeSpanTimer = new Timer(20);
                },
                updateEntity: function(timing, entity) {
                    var pickupComponent = entity.getComponent('pickup'),
                        quadComponent = entity.getComponent('quad');

                    if (Meteor.isServer && pickupComponent._lifeSpanTimer.isExpired) {
                        this.world.removeEntity(entity);
                        return;
                    }

                    // animate hover
                    if (pickupComponent.hover) {
                        quadComponent.offsetPosition.y = pickupComponent.hover.amplitude * (Math.sin(timing.elapsed * pickupComponent.hover.speed));
                    }
                }
            });

            return PickupSystem;
        }
    ]);
