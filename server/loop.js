'use strict';

var loop = function () {
	var startTime = (new Date().getTime()) / 1000.0;
	var lastTimestamp = startTime;
	var _timing = {};

	function onRequestedFrame() {
	    var timestamp = (new Date().getTime()) / 1000.0;

	    setTimeout(onRequestedFrame, 200);

	    _timing.timestamp = timestamp;
	    _timing.elapsed = timestamp - startTime;
	    _timing.frameTime = timestamp - lastTimestamp;

	    _timing.frameTime = Math.min(_timing.frameTime, 0.3);

	    World.update(_timing.frameTime, _timing.elapsed, _timing.timestamp);

	    lastTimestamp = timestamp;
	}

	setTimeout(onRequestedFrame, 1000);
};

Meteor.startup(function () {
	loop();
});
