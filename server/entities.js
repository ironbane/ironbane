'use strict';
/* global Entities */

Entities.allow({
	insert: function (userId, entity) {
		return false;
	},
	update: function (userId, entity, fields, modifier) {
		var containsInvalidFields = !!_.difference(fields, ['position', 'rotation']).length;
		return entity.owner === userId && !containsInvalidFields;
	},
	remove: function (userId, entity) {
		return entity.owner === userId;
	}
});

Meteor.publish('entities', function () {
	return Entities.find({});
});
