/*global Collections:true*/
'use strict';

var validator = Meteor.npmRequire('validator');

Meteor.methods({
	achieve: function (data) {

		var user = Meteor.user();

		var character = Entities.findOne({
		    active: true,
		    owner: user._id
		});

		if (!character) {
			throw new Meteor.Error('noActiveCharacterForAchievement');
		}

		var entity = Entities.findOne({
			name: data.name
		});

		if (!entity) {
			throw new Meteor.Error('noEntityForAchievement');
		}


		// TODO check if the achievement exists on the level
		if (Collections.Achievements.find({
			owner: character._id,
			name: data.name
		}).count() !== 0) {
			throw new Meteor.Error('achievementExists');
		}
		// TODO check for distance


		Collections.Achievements.insert({
			owner: character._id,
			name: data.name
		});


		if (entity.userData && entity.userData.message) {
			Meteor.call('chatAnnounce', entity.userData.message.replace('{{ charname }}', character.name));
		}

	}
});
