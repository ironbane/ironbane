angular
    .module('server.services.zones', [
        'models',
        'services.contentLoader',
        'global.constants.game',
        'server.services',
        'game.threeWorld',
        'systems.lifespan'
    ])
    .run([
        'ZonesCollection',
        'ContentLoader',
        'ThreeWorld',
        '$injector',
        '$activeWorlds',
        function(ZonesCollection, ContentLoader, ThreeWorld, $injector, $activeWorlds) {
            'use strict';

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
                'LifeSpan',
                // 'Armor',
                // 'Health',
                'Teleporter'
            ];

            var path = Meteor.npmRequire('path');
            var walk = Meteor.npmRequire('walkdir');

            var meteorBuildPath = path.resolve('.') + '/';
            var meteorBuildPublicPath = meteorBuildPath + '../web.browser/app/';
            var scenePath = meteorBuildPublicPath + 'scene';


            ContentLoader.load().then(Meteor.bindEnvironment(function () {

                walk(scenePath, {
                    'no_recurse': true,
                }, Meteor.bindEnvironment(function(filePath) {
                    var sceneId = path.basename(filePath);

                    if (Meteor.settings.public.useDevZone && sceneId.indexOf('dev-') === -1) {
                        return;
                    }

                    var world = $activeWorlds[sceneId] = new ThreeWorld();

                    // TODO: prolly track this elsewhere
                    world._ownerCache = {};

                    angular.forEach(systemsForWorlds, function(system) {
                        var registeredSystemName = system + 'System';
                        if ($injector.has(registeredSystemName)) {
                            var Sys = $injector.get(registeredSystemName);
                            world.addSystem(new Sys(), angular.lowercase(system));
                        } else {
                            console.error(registeredSystemName + ' was not found!');
                        }
                    });

                    // load the initial zone data from the world file
                    Meteor.setTimeout(function() {
                        world.load(sceneId).then(function () {
                            console.log('Loaded zone:', world.name);
                        });
                    }, 10);
                }));

            }), function (err) {
                if (err) {
                    console.log('error zones.js:79 ', err);
                } else {
                    console.log('undefined error zones.js:79');
                }
            })
            .then(function () {}, function (err) {
                console.log(err.stack);
            });

        }
    ]);
