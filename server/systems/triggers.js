angular
    .module('server.systems.trigger', [
        'ces',
        'underscore',
        'engine.scriptBank'
    ])
    .factory('TriggerSystem', [
        '$log',
        '_',
        'System',
        'ScriptBank',
        function($log, _, System, ScriptBank) {
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

                        var scriptName, scriptParams;

                        if (component.enter) {
                            if (angular.isString(component.enter)) {
                                scriptName = component.enter;
                                scriptParams = null;
                            } else {
                                // assume it's an object
                                scriptName = component.enter.script;
                                scriptParams = component.enter.params;
                            }
                            ScriptBank.get(scriptName)
                                .then(function(Script) {
                                    component._enterScript = new Script(entity, world, scriptParams);
                                }, function(err) {
                                    $log.error('Error fetching enter script for trigger: ', component.enter, err);
                                });
                        }

                        if (component.exit) {
                            if (angular.isString(component.exit)) {
                                scriptName = component.exit;
                                scriptParams = null;
                            } else {
                                // assume it's an object
                                scriptName = component.exit.script;
                                scriptParams = component.exit.params;
                            }
                            ScriptBank.get(scriptName)
                                .then(function(Script) {
                                    component._exitScript = new Script(entity, world, scriptParams);
                                }, function(err) {
                                    $log.error('Error fetching exit script for trigger: ', component.exit, err);
                                });
                        }

                        if (component.stay) {
                            if (angular.isString(component.stay)) {
                                scriptName = component.stay;
                                scriptParams = null;
                            } else {
                                // assume it's an object
                                scriptName = component.stay.script;
                                scriptParams = component.stay.params;
                            }
                            ScriptBank.get(scriptName)
                                .then(function(Script) {
                                    component._stayScript = new Script(entity, world, scriptParams);
                                }, function(err) {
                                    $log.error('Error fetching stay script for trigger: ', component.stay, err);
                                });
                        }
                    });
                },
                update: function() {
                    // TODO: hook into physics for collision checks instead?
                    var world = this.world;
                    var triggers = world.getEntities('trigger');

                    triggers.forEach(function(triggerEntity) {
                        var triggerData = triggerEntity.getComponent('trigger'),
                            guestsToBeRemoved = [];

                        // now we need to scan each one's radius
                        if (triggerData.type === 'area') { // TODO: other types
                            angular.forEach(triggerData.guests, function(guest) {
                                var guestInRange = guest.position.clone().sub(triggerEntity.position).lengthSq() < (triggerData.range * triggerData.range);
                                if (guestInRange) {
                                    // fire the stay script, if any
                                    if (angular.isFunction(triggerData._stayScript)) {
                                        // stay timer (dont do every frame?)
                                        triggerData._stayScript.call(triggerData, guest);
                                    }
                                } else {
                                    // fire the exit script, if any
                                    if (angular.isFunction(triggerData._exitScript)) {
                                        triggerData._exitScript.call(triggerData, guest);
                                    }
                                    guestsToBeRemoved.push(guest);
                                }
                            });

                            // now clear out all the exiters
                            triggerData.guests = _.filter(triggerData.guests, function(guest) {
                                var removeIds = _.pluck(guestsToBeRemoved, 'id');
                                return !_.contains(removeIds, guest.id);
                            });

                            var others = world.getEntities('player'); // TODO: filtering based on mask
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
                                    if (angular.isFunction(triggerData._enterScript)) {
                                        triggerData._enterScript.call(triggerData, otherEntity);
                                    }
                                }
                            });
                        }
                    });
                }
            });

            return TriggerSystem;
        }
    ]);
