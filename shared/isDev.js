// 'use strict';

if (Meteor.isClient) {
	ironbaneConstants.isDev = window.location.hostname === 'localhost';
}
else {
	ironbaneConstants.isDev = process.env.ROOT_URL.indexOf('localhost') !== -1;
}

console.log('You are running in ' + (ironbaneConstants.isDev ? 'development' : 'production') + ' mode.');
