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
    .service('GameService', function ($rootWorld, CameraSystem, ModelSystem,
        LightSystem, SpriteSystem, QuadSystem, HelperSystem, SceneSystem, ScriptSystem,
        SoundSystem, InputSystem, RigidBodySystem, CollisionReporterSystem, WieldItemSystem,
        EntityBuilder, $log, LevelLoader, ProcTreeSystem, ShadowSystem,
        FantasyNameGenerator, NameMeshSystem, Network) {

        'use strict';

        this.start = function () {
            $log.log('game service start!');

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


            // if (!options.offline) {
            //     $log.log('online mode!!!');
            //     $gameSocket.connect(options.server, options.level);

            //     $gameSocket.on('spawn', function (data) {
            //         $log.log('spawn', data);

            //         createPlayer(data);
            //         // we do this AFTER the player is created so the ghost doesn't win
            //         $rootWorld.getSystem('net').enabled = true;
            //     });
            // }

            LevelLoader.load('obstacle-test-course-one').then(function () {

            }, function (err) {
                $log.warn('error loading level: ', err);
            });
        };

        this.enterGame = function () {

        	// Just insert our entity as player

        	var user = Meteor.user();

        	var characters = Entities.find({
        		owner: user._id
        	});

        	if (characters.count() === 0) {

        		var genName = FantasyNameGenerator.generateName('mmo');

        		// Insert a new character
				Entities.insert({
					owner: user._id,
					name: genName,
					position: (new THREE.Vector3(10, 30, 0)).serialize(),
					rotation: (new THREE.Euler()).serialize(),
					components: {
	                    quad: {
	                        transparent: true,
	                        texture: 'images/characters/prefab/' + _.sample(_.range(1, 11)) + '.png'
	                    },
						'name-mesh': {
							text: genName
						},
	                    script: {
	                        scripts: [
	                            '/scripts/built-in/sprite-sheet.js',
	                        ]
	                    },
	                    shadow: {},
					}
				}, function (err) {
					if (err) {
						throw err;
					}
				});
        	}




        };

        this.leaveGame = function () {

        };
    });
