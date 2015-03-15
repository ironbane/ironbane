angular.module('game.scripts.spawn-100-bunnies', ['components.script', 'three', 'engine.entity-builder'])
    .run(function (ScriptBank, THREE, EntityBuilder, $rootWorld, Util) {
        'use strict';

        var Spawn100Bunnies = function (entity, world) {
            this.entity = entity;
            this.world = world;

            this.spawnedBunnies = false;
        };

        var spawnBunny = function (i) {
            setTimeout(function () {
                // console.log('Spawning ' + i);
                var bunny = EntityBuilder.build('Bunny', {
                    rotation: [0, Util.getRandomFloat(0, Math.PI * 2), 0],
                    // position: [-2, 170, -8],
                    position: [Util.getRandomFloat(-3, -2), 100, Util.getRandomFloat(-8, -7)],
                    components: {
                        quad: {
                            transparent: true,
                            texture: 'assets/images/characters/skin/29.png'
                        },
                        rigidBody: {
                            shape: {
                                type: 'sphere',
                                // height: 1,
                                radius: 0.5
                            },
                            mass: 1,
                            friction: 0,
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
                        // helper: {
                        //     line: true
                        // },
                        script: {
                            scripts: [
                                '/scripts/built-in/look-at-camera.js',
                                '/scripts/built-in/sprite-sheet.js',
                            ]
                        },
                        health: {
                            max: 5,
                            value: 5
                        }
                    }
                });
                $rootWorld.addEntity(bunny);
            }, i * 100);
        };

        Spawn100Bunnies.prototype.update = function (dt, elapsed, timestamp) {

            if (this.entity.position.y < 15 && !this.spawnedBunnies) {
                this.spawnedBunnies = true;

                for (var i = 0; i < 100; i++) {
                    spawnBunny(i);
                }

            }
        };

        ScriptBank.add('/scripts/special/spawn-100-bunnies.js', Spawn100Bunnies);
    });
