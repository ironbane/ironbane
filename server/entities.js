'use strict';
/* global Entities */

Entities.allow({
	insert: function (userId, party) {
		return true;
	},
	update: function (userId, party, fields, modifier) {
		return true;
	},
	remove: function (userId, party) {
		return true;
	}
});

Meteor.publish('entities', function () {
	return Entities.find({});
});
