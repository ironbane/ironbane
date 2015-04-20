angular
    .module('engine.game-service', [
        'game.game-loop',
        'game.world-root',
        'components',
        'game.systems',
        'game.scripts',
        'prefabs',
        'engine.entity-builder',
        'engine.input.input-system',
        'util.name-gen',
        // shared systems
        'systems.mesh'
    ])
    .service('GameService', [
        '$rootWorld',
        'CameraSystem',
        'LightSystem',
        'SpriteSystem',
        'QuadSystem',
        'HelperSystem',
        'OctreeSystem',
        'ScriptSystem',
        'SoundSystem',
        'InputSystem',
        'RigidBodySystem',
        'CollisionReporterSystem',
        'WieldItemSystem',
        'EntityBuilder',
        '$log',
        'ProcTreeSystem',
        'ShadowSystem',
        'FantasyNameGenerator',
        'NameMeshSystem',
        'NetworkSystem',
        'TriggerSystem',
        'MeshSystem',
        function($rootWorld, CameraSystem, LightSystem, SpriteSystem, QuadSystem, HelperSystem, OctreeSystem, ScriptSystem,
            SoundSystem, InputSystem, RigidBodySystem, CollisionReporterSystem, WieldItemSystem,
            EntityBuilder, $log, ProcTreeSystem, ShadowSystem,
            FantasyNameGenerator, NameMeshSystem, NetworkSystem, TriggerSystem, MeshSystem) {
            'use strict';

            this.start = function() {
                // ALL these systems have to load before other entities
                // they don't load stuff after the fact...
                // TODO: fix that

                $rootWorld.addSystem(new NameMeshSystem());

                $rootWorld.addSystem(new QuadSystem(), 'quads');
                $rootWorld.addSystem(new MeshSystem(), 'meshes'); // meshes need high priority, at least before rigidbody
                $rootWorld.addSystem(new OctreeSystem(), 'octree'); // needs a mesh, gotta go after that

                $rootWorld.addSystem(new RigidBodySystem(), 'rigidbody');
                $rootWorld.addSystem(new CollisionReporterSystem(), 'collisions');

                $rootWorld.addSystem(new InputSystem(), 'input');
                $rootWorld.addSystem(new SoundSystem(), 'sound');
                $rootWorld.addSystem(new ScriptSystem(), 'scripts');
                $rootWorld.addSystem(new ProcTreeSystem(), 'proctree');
                $rootWorld.addSystem(new SpriteSystem());
                $rootWorld.addSystem(new LightSystem());

                $rootWorld.addSystem(new HelperSystem());
                $rootWorld.addSystem(new WieldItemSystem());
                $rootWorld.addSystem(new ShadowSystem());
                $rootWorld.addSystem(new TriggerSystem(), 'triggers');
                $rootWorld.addSystem(new NetworkSystem(), 'net');

                // NOTE: this should be the LAST system as it does rendering!!
                $rootWorld.addSystem(new CameraSystem(), 'camera');

                // Initialize Meteor's entities collection
                //Network.init();
            };
        }
    ]);
