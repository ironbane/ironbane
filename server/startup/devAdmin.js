Meteor.startup(function () {
	if (ironbaneConstants.isDev) {
	    if (Meteor.users.find({}).count() === 0) {
	    	var userId = Accounts.createUser({
	    		username: 'admin',
	    		password: 'admin'
	    	});

	    	Roles.addUsersToRoles(userId, ['game-master']);
	    }
	}
});
