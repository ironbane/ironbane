Meteor.users.find({
	'status.online': true
}).observe({
	added: function (user) {
		// user just came online

	},
	removed: function (user) {
		// user just went offline

		Entities.update({
			owner: user._id
		}, {
			$set: {
				active: false
			}
		}, {
			multi: true
		});
	}
});
