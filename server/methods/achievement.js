/*global Collections:true*/
(function() {
    'use strict';

    var validator = Meteor.npmRequire('validator');

    function getAchievementEntity(achievementId, level) {
        var entity = Entities.findOne({
            name: achievementId,
            level: level
        });

        if (!entity) {
            throw new Meteor.Error(['noEntityForAchievement', achievementId, level].join(' : '));
        }

        return entity;
    }

    function achievementExists(charId, achievementId, level) {
        return Collections.Achievements.find({
            owner: charId,
            name: achievementId,
            level: level
        }).count() !== 0;
    }

    function addAchievement(achievementData, announce) {
        Collections.Achievements.insert({
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

    Meteor.methods({
        achieve: function(data) {
            var user = Meteor.user();

            var character = Entities.findOne({
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

            var hasAnnouncment = (entity.userData && entity.userData.message);
            var achievementData = {
                charId: character._id,
                achievementId: data.name,
                level: data.level,
                charName: character.name,
                message: hasAnnouncment ? entity.userData.message : null
            };

            addAchievement(achievementData, hasAnnouncment);
        },
        giveAchievement: function(achievementId, level, charId, announce) {
            var loggedInUser = Meteor.user();

            // game master admin function
            // doesn't care about distance checks or active characters
            if (!loggedInUser || !Roles.userIsInRole(loggedInUser, ['game-master', 'admin'])) {
                throw new Meteor.Error(403, 'Access denied');
            }

            var entity = getAchievementEntity(achievementId, level);

            var character = Entities.findOne({
                _id: charId
            });

            var doAnnouncment = announce && (entity.userData && entity.userData.message);
            var achievementData = {
                charId: character._id,
                name: achievementId,
                level: level,
                charName: character.name,
                message: doAnnouncment ? entity.userData.message : null
            };

            addAchievement(achievementData, doAnnouncment);
        },
        takeAchievement: function(achievementId, level, charId) {
            var loggedInUser = Meteor.user();

            // game master admin function
            if (!loggedInUser || !Roles.userIsInRole(loggedInUser, ['game-master', 'admin'])) {
                throw new Meteor.Error(403, 'Access denied');
            }

            Collections.Achievements.remove({
                owner: charId,
                name: achievementId,
                level: level
            });

            // TODO: log admin action in history?
        }
    });

})();
