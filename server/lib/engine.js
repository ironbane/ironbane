/*global Collections: true, Entities: true*/
angular
    .module('IronbaneServer', [
        'ng',
        'game.world-root',
        'game.threeWorld',
        'systems.autoAnnounceSystem',
        'components',
        'prefabs',
        'engine.entity-cache',
        'engine.entity-builder',
        'server.characterService',
        'server.gameService',
        'systems.network'
    ])
    .value('$activeWorlds', {})
    .run([
        '$log',
        '$rootWorld',
        'AutoAnnounceSystem',
        'EntityBuilder',
        '$activeWorlds',
        'ThreeWorld',
        'NetworkSystem',
        function($log, $rootWorld, AutoAnnounceSystem, EntityBuilder, $activeWorlds, ThreeWorld, NetworkSystem) {
            'use strict';

            // on the server the rootWorld isn't actually tied to any scene
            $rootWorld.addSystem(new AutoAnnounceSystem());

            // populate all the worlds (zones)
            var zonesCursor = Collections.Zones.find({});
            zonesCursor.observe({
                added: function(doc) {
                    var world = $activeWorlds[doc.name] = new ThreeWorld(doc.name);
                    $log.log('adding zone: ', world.name);

                    // setup the systems this world will use
                    world.addSystem(new NetworkSystem());

                    // load the initial zone data from the world file
                    world.load(doc.name);
                },
                removed: function(doc) {
                    // TODO: add some shutdown code for the zone (persist to db, etc)
                    delete $activeWorlds[doc.name];
                }
            });

            /*var entitiesCursor = Entities.find({});
            entitiesCursor.observe({
                added: function(doc) {
                    if ($activeWorlds[doc.level]) {
                        var ent = EntityBuilder.load(doc);
                        if (ent) {
                            $activeWorlds[doc.level].addEntity(ent);
                        } else {
                            $log.log('error building entity for: ', doc);
                        }
                        //$log.log('adding entity: ', doc.name, ' to ', doc.level, ' count: ', $activeWorlds[doc.level].getEntities().length);
                    }
                },
                removed: function(doc) {
                    var toBeRemoved = [];
                    if ($activeWorlds[doc.level]) {
                        $activeWorlds[doc.level].traverse(function(node) {
                            if (node.doc && node.doc._id === doc._id) {
                                toBeRemoved.push(node);
                            }
                        });
                        angular.forEach(toBeRemoved, function(removed) {
                            $activeWorlds[doc.level].removeEntity(removed);
                        });
                    }
                }
            });*/
        }
    ])
    .run([
        '$log',
        '$window',
        '$rootWorld',
        '$activeWorlds',
        function($log, $window, $rootWorld, $activeWorlds) {
            'use strict';

            var startTime = (new Date().getTime()) / 1000.0;
            var lastTimestamp = startTime;
            var _timing = {};

            function onRequestedFrame() {
                var timestamp = (new Date().getTime()) / 1000.0;

                Meteor.setTimeout(onRequestedFrame, 200);

                _timing.timestamp = timestamp;
                _timing.elapsed = timestamp - startTime;
                _timing.frameTime = timestamp - lastTimestamp;

                _timing.frameTime = Math.min(_timing.frameTime, 0.3);

                $rootWorld._timing = _timing;
                $rootWorld.update(_timing.frameTime, _timing.elapsed, _timing.timestamp);

                // ideally this would be clustered perhaps?
                angular.forEach($activeWorlds, function(world) {
                    world._timing = _timing;
                    world.update(_timing.frameTime, _timing.elapsed, _timing.timestamp);
                });

                lastTimestamp = timestamp;
            }

            $log.log('Ironbane booting up game world...');
            Meteor.setTimeout(onRequestedFrame, 200);
        }
    ]);
