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
        'EntitiesCollection',
        function($log, $rootWorld, $injector, AutoAnnounceSystem, EntityBuilder, $activeWorlds,
            ThreeWorld, $components, ZonesCollection, EntitiesCollection) {
            'use strict';

            // on the server the rootWorld isn't actually tied to any scene
            $rootWorld.addSystem(new AutoAnnounceSystem());

            var systemsForWorlds = [ // order matters
                'Network',
                'Persistence',
                'Damage',
                'Mesh',
                'Spawn',
                'Trigger',
                'Movers',
                'Actor',
                'Inventory'
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


            // Make sure players are set to inactive incase the server crashes
            // otherwise they'll get the "already-in-game" error and can't log in.
            // TODO move this somewhere else?
            EntitiesCollection.update({}, {
                $set: {
                    active: false
                }
            }, {
                multi: true
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
                            ent.addComponent('netSend');
                            ent.addComponent('netRecv');
                            ent.addComponent('player');
                            ent.addComponent('persisted', {_id: doc._id});
                            ent.addComponent('steeringBehaviour');
                            ent.addComponent('fighter', {
                                faction: 'ravenwood'
                            });
                            ent.owner = doc.owner;

                            // Used to access metadata like cheats later on
                            ent.metadata = {
                                cheats: doc.cheats
                            };

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
