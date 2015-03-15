angular
    .module('engine.game-service', [
        'game.game-loop',
        'game.world-root',
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
        SoundSystem, InputSystem, RigidBodySystem, CollisionReporterSystem, WieldItemSystem, NetSystem,
        EntityBuilder, $gameSocket, $log, LevelLoader, ProcTreeSystem, ShadowSystem,
        FantasyNameGenerator, NameMeshSystem) {

        'use strict';

        var createPlayer = function (data) {
            var defaultData = {
                components: {
                    ghost: {
                        id: data._id,
                        player: true // this so we don't sync up TODO: don't ghost player
                    },
                    quad: {
                        transparent: true,
                        texture: 'assets/images/characters/skin/2.png'
                    },
                    rigidBody: {
                        shape: {
                            type: 'capsule',
                            width: 0.5,
                            height: 1.0,
                            depth: 0.5,
                            radius: 0.5

                            // type: 'sphere',
                            // radius: 0.5
                        },
                        mass: 1,
                        friction: 0.0,
                        restitution: 0,
                        allowSleep: false,
                        lock: {
                            position: {
                                x: false,
                                y: false,
                                z: false
                            },
                            rotation: {
                                x: true,
                                y: true,
                                z: true
                            }
                        }
                    },
                    collisionReporter: {

                    },
                    light: {
                        type: 'PointLight',
                        color: 0x60511b,
                        distance: 3.5
                    },
                    health: {
                        max: 5,
                        value: 5
                    },
                    shadow: {

                    },
                    camera: {
                        aspectRatio: $rootWorld.renderer.domElement.width / $rootWorld.renderer.domElement.height
                    },
                    script: {
                        scripts: [
                            '/scripts/built-in/character-controller.js',
                            '/scripts/built-in/character-multicam.js',
                            '/scripts/built-in/sprite-sheet.js',
                        ]
                    }
                }
            };

            var finalData = angular.extend({}, data, defaultData);
            angular.extend(finalData.components, data.components);
            $log.log('finalData', finalData);
            // TODO: move this to more specific player creation service method
            var player = EntityBuilder.build('Player', finalData);
            $rootWorld.addEntity(player);

            $log.log('player ent: ', player);
            return player;
        };

        this.start = function (options) {
            options.offline = !!options.offline;

            $log.log('game service start!', options);

            // ALL these systems have to load before other entities
            // they don't load stuff after the fact...
            // TODO: fix that
            $rootWorld.addSystem(new SceneSystem());
            if (!options.offline) {
                $rootWorld.addSystem(new NetSystem(), 'net');
            }
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

            if (!options.offline) {
                $log.log('online mode!!!');
                $gameSocket.connect(options.server, options.level);

                $gameSocket.on('spawn', function (data) {
                    $log.log('spawn', data);

                    createPlayer(data);
                    // we do this AFTER the player is created so the ghost doesn't win
                    $rootWorld.getSystem('net').enabled = true;
                });
            }

            LevelLoader.load(options.level).then(function () {
                var characterName = FantasyNameGenerator.generateName('mmo'),
                    characterSprite = 'assets/images/characters/prefab/' + _.sample(_.range(1, 11)) + '.png';

                var playerData = {
                    handle: characterName,
                    components: {
                        quad: {
                            texture: characterSprite,
                            transparent: true
                        },
                        'name-mesh': {
                            text: characterName
                        }
                    }
                };

                if (!options.offline) {
                    // after the level and whatnot is loaded, request a player spawn
                    $gameSocket.emit('request spawn', playerData);
                } else {
                    //$log.log('offline mode!');
                    createPlayer({
                        _id: 'abc123',
                        handle: characterName,
                        position: [22, 25, -10],
                        rotation: [0, Math.PI - 0.4, 0],
                        components: {
                            quad: {
                                texture: characterSprite,
                                transparent: true
                            },
                            'name-mesh': {
                                text: characterName
                            }
                        }
                    });
                }
            }, function (err) {
                $log.warn('error loading level: ', err);
            });
        };
    });
