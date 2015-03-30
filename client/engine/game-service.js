angular
    .module('engine.game-service', [
        'game.game-loop',
        'game.world-root',
        'game.main-menu',
        'game.network',
        'components',
        'game.scripts',
        'game.prefabs',
        'engine.entity-builder',
        'engine.sound-system',
        'engine.input.input-system',
        'engine.level-loader',
        'util.name-gen',
        'components.scene.name-mesh'
    ])
    .service('GameService', ['$rootWorld', 'CameraSystem', 'ModelSystem', 'LightSystem', 'SpriteSystem', 'QuadSystem', 'HelperSystem', 'SceneSystem', 'ScriptSystem', 'SoundSystem', 'InputSystem', 'RigidBodySystem', 'CollisionReporterSystem', 'WieldItemSystem', 'EntityBuilder', '$log', 'LevelLoader', 'ProcTreeSystem', 'ShadowSystem', 'FantasyNameGenerator', 'NameMeshSystem', 'Network', 'Util', function ($rootWorld, CameraSystem, ModelSystem,
        LightSystem, SpriteSystem, QuadSystem, HelperSystem, SceneSystem, ScriptSystem,
        SoundSystem, InputSystem, RigidBodySystem, CollisionReporterSystem, WieldItemSystem,
        EntityBuilder, $log, LevelLoader, ProcTreeSystem, ShadowSystem,
        FantasyNameGenerator, NameMeshSystem, Network, Util) {

        'use strict';

        this.start = function () {
            // ALL these systems have to load before other entities
            // they don't load stuff after the fact...
            // TODO: fix that
            $rootWorld.addSystem(new SceneSystem());
            $rootWorld.addSystem(new NameMeshSystem());
            $rootWorld.addSystem(new InputSystem(), 'input');
            $rootWorld.addSystem(new SoundSystem(), 'sound');
            $rootWorld.addSystem(new ScriptSystem(), 'scripts');
            $rootWorld.addSystem(new ProcTreeSystem(), 'proctree');
            $rootWorld.addSystem(new SpriteSystem());
            $rootWorld.addSystem(new ModelSystem());
            $rootWorld.addSystem(new LightSystem());
            $rootWorld.addSystem(new QuadSystem());
            $rootWorld.addSystem(new RigidBodySystem(), 'rigidbody');
            $rootWorld.addSystem(new CollisionReporterSystem());
            $rootWorld.addSystem(new HelperSystem());
            $rootWorld.addSystem(new WieldItemSystem());
            $rootWorld.addSystem(new ShadowSystem());

            // NOTE: this should be the LAST system as it does rendering!!
            $rootWorld.addSystem(new CameraSystem(), 'camera');


            // Initialize Meteor's entities collection
            Network.init();

            // Autorun means it auto runs the function when reactive variables inside change
            // In this case, when the activeLevel var changes. So it's very easy for us to change the level
            // just change the activeLevel variable. In addition subscription calls will be auto updated as well
            Util.waitForMeteorGuestUserLogin(function () {
	            Session.set('activeLevel', 'obstacle-test-course-one');
	            Meteor.autorun(function () {

	            	var nodesToBeRemoved = [];

					$rootWorld.traverse(function (node) {
						if (node.doc && node.doc.level !== Session.get('activeLevel')) {
							nodesToBeRemoved.push(node);
						}
					});

					nodesToBeRemoved.forEach(function (node) {
						$rootWorld.removeEntity(node);
					});

		            LevelLoader.load(Session.get('activeLevel')).then(function () {

		            }, function (err) {
		                $log.warn('error loading level: ', err);
		            });
	            });
            });

        };


    }]);
