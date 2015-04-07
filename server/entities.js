'use strict';
/* global Entities */

Entities.allow({
	insert: function (userId, entity) {
		return false;
	},
	update: function (userId, entity, fields, modifier) {
		var allowedFields = ['position', 'rotation'];

		var containsInvalidFields = false;
		fields.forEach(function (field) {
			if (!_.contains(allowedFields, field)) {
				containsInvalidFields = true;
			}
		});

		return entity.owner === userId && !containsInvalidFields;
	},
	remove: function (userId, entity) {
		return entity.owner === userId;
	}
});

Meteor.publish('entities', function () {
	return Entities.find({});
});
