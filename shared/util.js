
(function () {

	var self = this;

	self.sharedIbUtil = {};

	self.sharedIbUtil.sequencedTimers = {};
	self.sharedIbUtil.chooseFromSequence = function (a) {
		var uid = '';
		for (var b in a) uid += b;
		if (_.isUndefined(self.sharedIbUtil.sequencedTimers[uid])) self.sharedIbUtil.sequencedTimers[uid] = 0;
		var value = a[self.sharedIbUtil.sequencedTimers[uid]];
		self.sharedIbUtil.sequencedTimers[uid] ++;
		if (self.sharedIbUtil.sequencedTimers[uid] >= a.length) self.sharedIbUtil.sequencedTimers[uid] = 0;
		return value;
	};

	self.sharedIbUtil.timeSince = function (date) {
	    var seconds = Math.floor((new Date() - date) / 1000);

	    var interval = Math.floor(seconds / 31536000);

	    if (interval >= 1) {
	        return interval + ' years';
	    }
	    interval = Math.floor(seconds / 2592000);
	    if (interval >= 1) {
	        return interval + ' months';
	    }
	    interval = Math.floor(seconds / 86400);
	    if (interval >= 1) {
	        return interval + ' days';
	    }
	    interval = Math.floor(seconds / 3600);
	    if (interval >= 1) {
	        return interval + ' hours';
	    }
	    interval = Math.floor(seconds / 60);
	    if (interval >= 1) {
	        return interval + ' minutes';
	    }
	    return Math.floor(seconds) + ' seconds';
	};

})(this);
