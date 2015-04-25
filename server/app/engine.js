angular
    .module('IronbaneServer', [
        'ng',
        'ces',
        'engine.timing',
        'game.world-root',
        'game.threeWorld',
        'systems.autoAnnounceSystem',
        'components',
        'prefabs',
        'engine.entity-cache',
        'engine.entity-builder',
        'models',
        'server.services',
        'systems.network'
    ])
    .run([
        '$log',
        '$rootWorld',
        'AutoAnnounceSystem',
        'EntityBuilder',
        '$activeWorlds',
        'ThreeWorld',
        'NetworkSystem',
        '$components',
        'ZonesCollection',
        'EntitiesCollection',
        function($log, $rootWorld, AutoAnnounceSystem, EntityBuilder, $activeWorlds, ThreeWorld, NetworkSystem, $components, ZonesCollection, EntitiesCollection) {
            'use strict';

            // on the server the rootWorld isn't actually tied to any scene
            $rootWorld.addSystem(new AutoAnnounceSystem());

            // populate all the worlds (zones)
            var zonesCursor = ZonesCollection.find({});
            zonesCursor.observe({
                added: function(doc) {
                    var world = $activeWorlds[doc.name] = new ThreeWorld(doc.name);
                    $log.log('adding zone: ', world.name);
                    // TODO: prolly track this elsewhere
                    world._ownerCache = {};

                    // setup the systems this world will use
                    world.addSystem(new NetworkSystem(), 'network');

                    // load the initial zone data from the world file
                    Meteor.setTimeout(function() { world.load(doc.name); }, 10);
                },
                removed: function(doc) {
                    // TODO: add some shutdown code for the zone (persist to db, etc)
                    delete $activeWorlds[doc.name];
                }
            });

            var entitiesCursor = EntitiesCollection.find({
                active: true
            });
            entitiesCursor.observe({
                added: function(doc) {
                    if ($activeWorlds[doc.level]) {
                        var ent = EntityBuilder.build(doc);
                        if (ent) {
                            // it's unlikely that the server will not want to send an entity
                            ent.addComponent($components.get('netSend'));
                            ent.addComponent($components.get('netRecv'));
                            ent.owner = doc.owner;
                            // TODO: decorate entity with other components, such as "player", etc. like the client does
                            $activeWorlds[doc.level]._ownerCache[doc.owner] = ent.uuid;
                            $activeWorlds[doc.level].addEntity(ent);
                        } else {
                            $log.log('error building entity for: ', doc);
                        }
                        //$log.log('adding entity: ', doc.name, ' to ', doc.level, ' count: ', $activeWorlds[doc.level].getEntities().length);
                    }
                },
                removed: function(doc) {
                    if ($activeWorlds[doc.level]) {
                        var worldId = $activeWorlds[doc.level]._ownerCache[doc.owner],
                            entity = $activeWorlds[doc.level].scene.getObjectByProperty('uuid', worldId);

                        if (entity) {
                            $activeWorlds[doc.level].removeEntity(entity);
                        } else {
                            $log.debug('id not found', worldId, doc);
                        }
                    }
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
