'use strict';

var path = Npm.require('path');
var fs = Npm.require('fs');
var walk = Meteor.npmRequire('walkdir');

var meteorBuildPath = path.resolve('.') + '/';
var meteorRootProjectPath = meteorBuildPath.split('.meteor')[0];

var meteorBuildPublicPath = meteorBuildPath + '../web.browser/app/';
var meteorRootProjectPublicPath = meteorRootProjectPath + 'public/';

Meteor.startup(function () {
	var scenePath = meteorBuildPublicPath + 'scene';

	walk(scenePath, {
		'no_recurse': true,
	}, Meteor.bindEnvironment(function (filePath, stat) {
		var sceneId = path.basename(filePath);

		fs.readFile(filePath + '/ib-entities.json', 'utf8', Meteor.bindEnvironment(function (err, data) {
			if (err) {
				if (err.code !== 'ENOENT') {
					throw err;
				}
			}
			else {
				var entities = JSON.parse(data);

				Entities.remove({
					fromClara: true,
					level: sceneId
				});

				entities.forEach(function(entity) {
					entity.fromClara = true;
					entity.level = sceneId;
					entity.active = true;

					var id = Entities.insert(entity);
				});

			}
		}));
	}));

});
