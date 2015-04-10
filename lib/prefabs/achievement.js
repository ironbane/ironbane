angular
    .module('prefabs.achievementTrigger', [
        'engine.scriptBank',
        'underscore',
        'engine.entity-cache'
    ])
    .factory('AchievementTriggerPrefab', [
        '$log',
        'ScriptBank',
        '_',
        '$entityCache',
        function($log, ScriptBank, _, $entityCache) {
            'use strict';

            ScriptBank.add('achievementTriggerEnter', function achievementTriggerEnter(triggerEntity, world, params) {
                return function callbackFn(otherEntity) {
                    var triggerComponent = this;
                    //$log.debug('achievementTriggerEnter callback', triggerEntity, otherEntity, params);

                    // for now it needs to be mainPlayer (or the local client)
                    // TODO: move all this server side :(
                    var mainPlayer = $entityCache.get('mainPlayer');
                    if (otherEntity.id !== mainPlayer.id) {
                        return;
                    }

                    // otherEntity should be a player (as filtered by the mask)
                    triggerComponent._hasAchieved = triggerComponent._hasAchieved || [];

                    var charId = otherEntity.doc ? otherEntity.doc._id : null;
                    if (charId && !_.contains(triggerComponent._hasAchieved, charId)) {
                        Meteor.call('achieve', {
                            name: params.achievementId,
                            level: triggerEntity.doc.level // also watch out if this isn't via Clara
                        });
                        triggerComponent._hasAchieved.push(charId);
                    }
                };
            });

            return function(entityData) {
                var customs = entityData.userData || {};

                var assembly = {
                    components: {
                        trigger: {
                            mask: 'player',
                            enter: {
                                script: 'achievementTriggerEnter',
                                params: {
                                    achievementId: customs.achievementId,
                                    message: customs.message
                                }
                            }
                        }
                    }
                };

                // because we don't want to merge undefined values
                if (angular.isDefined(customs.range)) {
                    assembly.range = customs.range;
                }

                if (angular.isDefined(customs['trigger-type'])) {
                    assembly.type = customs['trigger-type'];
                }

                return assembly;
            };
        }
    ]);
