'use strict';
/* global Entities */

Entities.allow({
	insert: function (userId, entity) {
		return false;
	},
	update: function (userId, entity, fields, modifier) {
		return entity.owner === userId;
	},
	remove: function (userId, entity) {
		return entity.owner === userId;
	}
});

Meteor.publish('entities', function () {
	return Entities.find({});
});
