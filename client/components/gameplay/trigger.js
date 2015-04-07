angular
    .module('components.gameplay.trigger', [
        'ces',
        'underscore'
    ])
    .config(['$componentsProvider', function($componentsProvider) {
        'use strict';

        $componentsProvider.addComponentData({
            'trigger': {
                type:'area',
                range: 5,
                mask: 0,
                enter: '',
                exit: '',
                stay: ''
            }
        });
    }])
    .factory('TriggerSystem', [
        '_',
        'System',
        function(_, System) {
            'use strict';

            var TriggerSystem = System.extend({
                addedToWorld: function(world) {
                    var system = this;
                    system._super(world);

                    world.entityAdded('trigger').add(function (entity) {
                        // as each entity is added to the world that contains a trigger component...
                        var component = entity.getComponent('trigger');
                        // let's add some volatile storage
                        component.guests = [];
                    });
                },
                update: function() {
                    // TODO: hook into physics for collision checks instead?
                    var world = this.world;
                    var triggers = world.getEntities('trigger');
                    var others = world.getEntities(); // TODO: spatial and/or bitwise filtering

                    triggers.forEach(function(triggerEntity) {
                        if (!triggerEntity.active) { // TODO: revisit this about multiple levels loaded by server (zones)
                            return;
                        }

                        var triggerData = triggerEntity.getComponent('trigger'),
                            guestsToBeRemoved = [];

                        // now we need to scan each one's radius
                        if (triggerData.type === 'area') { // TODO: other types
                            angular.forEach(triggerData.guests, function(guest) {
                                var guestInRange = guest.position.clone().sub(triggerEntity.position).lengthSq() < (triggerData.range * triggerData.range);
                                if (guestInRange) {
                                    // fire the stay script, if any
                                    // stay timer (dont do every frame?)
                                } else {
                                    // fire the exit script, if any
                                    guestsToBeRemoved.push(guest);
                                }
                            });

                            // now clear out all the exiters
                            triggerData.guests = _.without(triggerData.guests, guestsToBeRemoved);

                            others.forEach(function(otherEntity) {
                                var guestIds = _.pluck(triggerData.guests, 'id');

                                // don't check self
                                if (otherEntity.id === triggerEntity.id) {
                                    return;
                                }

                                // already a guest? should be sorted...
                                if (_.contains(guestIds, otherEntity.id)) {
                                    return;
                                }

                                var otherInRange = otherEntity.position.clone().sub(triggerEntity.position).lengthSq() < (triggerData.range * triggerData.range);
                                if(otherInRange) {
                                    triggerData.guests.push(otherEntity);
                                    // fire enter script, if any
                                }
                            });
                        }
                    });
                }
            });

            return TriggerSystem;
        }
    ]);
