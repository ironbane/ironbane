angular
    .module('IronbaneServer', [
        'ng',
        'ces',
        'engine.timing',
        'game.world-root',
        'game.threeWorld',
        'components',
        'prefabs',
        'engine.entity-cache',
        'engine.entity-builder',
        'models',
        'server.boot',
        'server.services',
        'server.systems'
    ])
    .run([
        '$log',
        '$rootWorld',
        '$injector',
        'AutoAnnounceSystem',
        'EntityBuilder',
        '$activeWorlds',
        'ThreeWorld',
        '$components',
        'ZonesCollection',
        function($log, $rootWorld, $injector, AutoAnnounceSystem, EntityBuilder, $activeWorlds,
            ThreeWorld, $components, ZonesCollection) {
            'use strict';

            // on the server the rootWorld isn't actually tied to any scene
            $rootWorld.addSystem(new AutoAnnounceSystem());
        }
    ])
    .run([
        '$log',
        '$window',
        '$rootWorld',
        '$activeWorlds',
        '$timing',
        function($log, $window, $rootWorld, $activeWorlds, $timing) {
            'use strict';

            function onRequestedFrame() {
                $timing.step();

                $rootWorld.update($timing.frameTime, $timing.elapsed, $timing.timestamp);

                // ideally this would be clustered perhaps?
                angular.forEach($activeWorlds, function(world) {
                    world.update($timing.frameTime, $timing.elapsed, $timing.timestamp);
                });

            }

            $log.log('Booting up game world');
            Meteor.setInterval(onRequestedFrame, 200);
        }
    ]);
