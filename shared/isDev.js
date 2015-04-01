// 'use strict';

isDev = false;

if (Meteor.isClient) {
	isDev = window.location.hostname === 'localhost';
}
else {
	isDev = process.env.ROOT_URL.indexOf('localhost') !== -1;
}

console.log('You are running in ' + (isDev ? 'development' : 'production') + ' mode.');
