angular
    .module('engine.game-service', [
        'game.world-root',
        'game.systems',
        'engine.input.input-system',
        // shared systems
        'systems.actor',
        'systems.armor',
        'systems.fighter',
        'systems.inventory',
        'systems.damage',
        'systems.mesh',
        'systems.projectile',
        'systems.steering'
    ])
    .service('GameService', [
        '$injector',
        '$rootWorld',
        '$log',
        function($injector, $rootWorld, $log) {
            'use strict';

            var _defaultSystems = [ // order matters
                'NameMesh',
                'Mesh',
                'RigidBody',
                'Quad',
                'Octree',
                'CollisionReporter',
                'Steering',
                'Actor',
                'Fighter',
                'Projectile',
                'Network',
                'Inventory',
                'Appearance',
                'Damage',
                'Armor',
                'Input',
                'Sound',
                'Script',
                'ProcTree',
                'Sprite',
                'Light',
                'Helper',
                'WieldItem',
                'MouseHelper',
                'Shadow',
                'Particle',
                'Trigger',
                'Camera'
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
