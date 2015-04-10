'use strict';

var path = Npm.require('path');
var fs = Npm.require('fs');
var walk = Meteor.npmRequire('walkdir');

var meteorBuildPath = path.resolve('.') + '/';
var meteorRootProjectPath = meteorBuildPath.split('.meteor')[0];

var meteorBuildPublicPath = meteorBuildPath + '../web.browser/app/';
var meteorRootProjectPublicPath = meteorRootProjectPath + 'public/';

Meteor.startup(function() {
    var scenePath = meteorBuildPublicPath + 'scene';

    // clear out available zones before reload
    Collections.Zones.remove({});

    walk(scenePath, {
        'no_recurse': true,
    }, Meteor.bindEnvironment(function(filePath, stat) {
        var sceneId = path.basename(filePath);

        // add to zones TODO: perhaps load some zone metadata from ib_world?
        Collections.Zones.insert({name: sceneId});

        fs.readFile(filePath + '/ib-entities.json', 'utf8', Meteor.bindEnvironment(function(err, data) {
            if (err) {
                if (err.code !== 'ENOENT') {
                    throw err;
                }
            } else {
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
