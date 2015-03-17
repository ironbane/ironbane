
Meteor.users.find({ "status.online": true }).observe({
  added: function(user) {
    // user just came online
    console.log('went online', user);

    // Set all characters
  },
  removed: function(user) {
    // user just went offline
    console.log('went offline', user);

    Entities.update({
    	owner: user._id
    }, {
    	$set: {
			active: false
    	}
    });
  }
});
