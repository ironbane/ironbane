angular
    .module('game.prefabs.achievementTrigger', [
        'engine.scriptBank',
        'underscore'
    ])
    .factory('AchievementTriggerPrefab', [
        '$log',
        'ScriptBank',
        '_',
        function($log, ScriptBank, _) {
            'use strict';

            ScriptBank.add('achievementTriggerEnter', function achievementTriggerEnter(triggerEntity, world, params) {
                return function callbackFn(otherEntity) {
                    var triggerComponent = this;
                    //$log.debug('achievementTriggerEnter callback', triggerEntity, otherEntity, params);

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

                return {
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
            };
        }
    ]);
