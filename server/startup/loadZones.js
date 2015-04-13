'use strict';

var path = Npm.require('path');
var fs = Npm.require('fs');
var walk = Meteor.npmRequire('walkdir');

var meteorBuildPath = path.resolve('.') + '/';
var meteorRootProjectPath = meteorBuildPath.split('.meteor')[0];

/*global Collections: true*/
var meteorBuildPublicPath = meteorBuildPath + '../web.browser/app/';

Meteor.startup(function() {
    var scenePath = meteorBuildPublicPath + 'scene';

    // clear out available zones before reload
    Collections.Zones.remove({});

    walk(scenePath, {
        'no_recurse': true,
    }, Meteor.bindEnvironment(function(filePath) {
        var sceneId = path.basename(filePath);
        // add to zones TODO: perhaps load some zone metadata from ib_world?
        Collections.Zones.insert({name: sceneId});
    }));

});
