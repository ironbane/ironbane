/*global Roles:true*/
angular
    .module('server.services.achievements', [
        'models'
    ])
    .service('AchievementsService', [
        'AchievementsCollection',
        'EntitiesCollection',
        function(AchievementsCollection, EntitiesCollection) {
            'use strict';

            function getAchievementEntity(achievementId, level) {
                // TODO: find from world simulation instead
                var entity = EntitiesCollection.findOne({
                    level: level,
                    'userData.entity': 'AchievementTrigger',
                    'userData.achievementId': achievementId
                });

                if (!entity) {
                    throw new Meteor.Error(['noEntityForAchievement', achievementId, level].join(' : '));
                }

                return entity;
            }

            function achievementExists(charId, achievementId, level) {
                return AchievementsCollection.find({
                    owner: charId,
                    name: achievementId,
                    level: level
                }).count() !== 0;
            }

            function addAchievement(achievementData, announce) {
                AchievementsCollection.insert({
                    owner: achievementData.charId,
                    name: achievementData.achievementId,
                    collectDate: new Date(),
                    level: achievementData.level
                });

                if (announce) {
                    Meteor.call('chatAnnounce', achievementData.message.replace('{{ charname }}', achievementData.charName), {
                        achievement: true
                    });
                }
            }

            this.achieve = function(data) {
                var user = Meteor.user();

                var character = EntitiesCollection.findOne({
                    active: true,
                    owner: user._id
                });

                if (!character) {
                    throw new Meteor.Error('noActiveCharacterForAchievement');
                }

                if (achievementExists(character._id, data.name, data.level)) {
                    throw new Meteor.Error('achievementExists');
                }

                var entity = getAchievementEntity(data.name, data.level);
                // TODO check for distance

                var hasAnnouncement = (entity.userData && entity.userData.message);
                var achievementData = {
                    charId: character._id,
                    achievementId: data.name,
                    level: data.level,
                    charName: character.name,
                    message: hasAnnouncement ? entity.userData.message : null
                };

                addAchievement(achievementData, hasAnnouncement);
            };

            this.give = function(achievementId, level, charId, announce) {
                var loggedInUser = Meteor.user();

                // game master admin function
                // doesn't care about distance checks or active characters
                if (!loggedInUser || !Roles.userIsInRole(loggedInUser, ['game-master', 'admin'])) {
                    throw new Meteor.Error(403, 'Access denied');
                }

                var entity = getAchievementEntity(achievementId, level);

                var character = EntitiesCollection.findOne({
                    _id: charId
                });

                var doAnnouncement = announce && (entity.userData && entity.userData.message);
                var achievementData = {
                    charId: character._id,
                    name: achievementId,
                    level: level,
                    charName: character.name,
                    message: doAnnouncement ? entity.userData.message : null
                };

                addAchievement(achievementData, doAnnouncement);
            };

            this.take = function(achievementId, level, charId) {
                var loggedInUser = Meteor.user();

                // game master admin function
                if (!loggedInUser || !Roles.userIsInRole(loggedInUser, ['game-master', 'admin'])) {
                    throw new Meteor.Error(403, 'Access denied');
                }

                AchievementsCollection.remove({
                    owner: charId,
                    name: achievementId,
                    level: level
                });

                // TODO: log admin action in history?
            };
        }
    ])
    .run([
        'AchievementsService',
        function(AchievementsService) {
            'use strict';

            Meteor.methods({
                achieve: AchievementsService.achieve,
                giveAchievement: AchievementsService.give,
                takeAchievement: AchievementsService.take
            });
        }
    ]);
