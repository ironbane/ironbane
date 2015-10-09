angular
    .module('engine.game-service', [
        'game.world-root',
        'game.systems',
        'engine.input.input-system',
        // shared systems
        'systems.actor',
        'systems.armor',
        'systems.health',
        'systems.buff',
        'systems.fighter',
        'systems.inventory',
        'systems.damage',
        'systems.teleporter',
        'systems.mesh',
        'systems.projectile',
        'systems.steering',
        'systems.pickup',
        'systems.lifespan'
    ])
    .service('GameService', [
        '$injector',
        '$rootWorld',
        '$log',
        function($injector, $rootWorld, $log) {
            'use strict';

            var _defaultSystems = [ // order matters
                'LifeSpan',
                'NameMesh',
                'Mesh',
                'Octree',
                'RigidBody',
                'Quad',
                'CollisionReporter',
                'Damage', // needs to be higher than anything checking the applied dmg (Inventory)
                'Steering',
                'Actor',
                'Fighter',
                'Projectile',
                'Network',
                'Inventory',
                'Appearance',
                'Armor',
                'Health',
                'Buff',
                'Input',
                'Sound',
                'Script',
                'Pickup',
                'Sprite',
                'Light',
                'Helper',
                'WieldItem',
                'MouseHelper',
                'Shadow',
                'Particle',
                'Teleporter',
                'Camera',
                'LocalTeleporter'
            ];

            this.start = function() {
                // ALL these systems have to load before other entities
                // they don't load stuff after the fact...
                // TODO: fix that
                angular.forEach(_defaultSystems, function(system) {
                    var registeredSystemName = system + 'System';
                    if ($injector.has(registeredSystemName)) {
                        var Sys = $injector.get(registeredSystemName);
                        $rootWorld.addSystem(new Sys(), angular.lowercase(system));
                    } else {
                        $log.debug(registeredSystemName + ' was not found!');
                    }
                });
            };
        }
    ]);
