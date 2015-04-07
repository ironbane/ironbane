
Meteor.setInterval(function () {
	/* clean out all guest accounts more than 1 hour old */
	var before = new Date();
	before.setHours(before.getHours() - 1);
	Accounts.removeOldGuests(before);
}, 3600 * 1000);
