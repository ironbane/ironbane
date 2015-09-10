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

            var systemsForWorlds = [ // order matters
                'Network',
                'Persistence',
                'Damage',
                'Mesh',
                'Spawn',
                'Buff',
                'Trigger',
                'Movers',
                'Actor',
                'Inventory',
                'Armor'
            ];

            // populate all the worlds (zones)
            var zonesCursor = ZonesCollection.find({});
            zonesCursor.observe({
                added: function(doc) {
                    var world = $activeWorlds[doc.name] = new ThreeWorld(doc.name);
                    $log.log('adding zone: ', world.name);
                    // TODO: prolly track this elsewhere
                    world._ownerCache = {};

                    angular.forEach(systemsForWorlds, function(system) {
                        var registeredSystemName = system + 'System';
                        if ($injector.has(registeredSystemName)) {
                            var Sys = $injector.get(registeredSystemName);
                            world.addSystem(new Sys(), angular.lowercase(system));
                        } else {
                            $log.debug(registeredSystemName + ' was not found!');
                        }
                    });

                    // load the initial zone data from the world file
                    Meteor.setTimeout(function() { world.load(doc.name); }, 10);
                },
                removed: function(doc) {
                    // TODO: add some shutdown code for the zone (persist to db, etc)
                    delete $activeWorlds[doc.name];
                }
            });
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

                $window.requestAnimationFrame(onRequestedFrame);
            }

            $log.log('Ironbane booting up game world...');
            $window.requestAnimationFrame(onRequestedFrame);
        }
    ]);
