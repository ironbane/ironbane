'use strict';

Meteor.startup(function() {
    if (process.env && process.env.TASK && process.env.TASK === 'importlevels') {
        console.log('importing levels...');
        global.importInjector = angular.injector(['util.claraImporter']);

        var importer = global.importInjector.get('ClaraImportTool');
        importer.exportClaraScenes()
            .then(function() {
                console.log('All done.');
                // after loading, then boot the game
                global.engine = angular.injector(['IronbaneServer']);
            }, console.log);
    } else {
        // this will boot up the whole server Game Engine
        global.engine = angular.injector(['IronbaneServer']);
    }
});
