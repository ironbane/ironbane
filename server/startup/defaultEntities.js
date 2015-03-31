'use strict';

Meteor.startup(function () {

	// Put in a few entities for the obstacle course
	// Normally these are imported from Clara, but
	// let's make it easier for first timers
	if (Entities.find({
		'fromClara': true,
		'level': 'obstacle-test-course-one',
	}).count() === 0) {
		var entities = [{
			'name': 'AmbientLight',
			'userData': {
				'entity': 'light'
			},
			'matrix': [1, 0, 0, 0, 0, 2.220446049250313e-16, -1, 0, 0, 1, 2.220446049250313e-16, 0, 1.6962000131607056, 31.2362003326416, 0, 1],
			'components': {
				'light': {
					'type': 'AmbientLight',
					'color': 12698049
				}
			},
			'fromClara': true,
			'level': 'obstacle-test-course-one',
			'active': true
		}, {
			'name': 'Mr. Fluffins',
			'userData': {
				'entity': 'Bunny'
			},
			'matrix': [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, -3.8324999809265137, 16.529699325561523, -7.498300075531006, 1],
			'components': {},
			'prefab': 'Bunny',
			'fromClara': true,
			'level': 'obstacle-test-course-one',
			'active': true
		}];

		entities.forEach(function (entity) {
			Entities.insert(entity);
		});

	}
})
