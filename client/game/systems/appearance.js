angular
    .module('game.systems.appearance', [
        'ces',
        'engine.textureLoader',
        'engine.char-builder'
    ])
    .factory('AppearanceSystem', [
        'System',
        'CharBuilder',
        'TextureLoader',
        function(System, CharBuilder, TextureLoader) {
            'use strict';

            var buildOrder = [
                'skin',
                'hair',
                'eyes',
                'feet',
                'body',
                'head'
            ];

            var AppearanceSystem = System.extend({
                addedToWorld: function(world) {
                    this._super(world);

                    var inventorySystem = world.getSystem('inventory');

                    inventorySystem.onEquipItem.add(function(entity, item) {
                        // this only works for quads (TODO: change to something different?)
                        if (!entity.hasComponent('quad')) {
                            return;
                        }

                        // listen to inventory system for equipment events
                        var inventory = entity.getComponent('inventory'),
                            quad = entity.getComponent('quad');

                        var options = {};
                        options.skin = quad.charBuildData.skin;
                        options.hair = quad.charBuildData.hair;
                        options.eyes = quad.charBuildData.eyes;
                        if (inventory.head) {
                            options.head = inventory.head.image;
                        }
                        if (inventory.body) {
                            options.body = inventory.body.image;
                        }
                        if (inventory.feet) {
                            options.feet = inventory.feet.image;
                        }

                        CharBuilder.makeChar(options).then(function(image) {
                            return TextureLoader.load(image)
                                .then(function(texture) {
                                    // TODO: check _quad still exists as this is outside of the first thread so might have changed since we asked
                                    quad._quad.material.map = texture;
                                    quad._quad.material.emissive.set('#999'); // char is always lit to some degree
                                    quad._quad.material.needsUpdate = true;
                                    quad._quad.geometry.buffersNeedUpdate = true;
                                    quad._quad.geometry.uvsNeedUpdate = true;
                                    quad._quad.material.transparent = true;
                                });
                        });
                    });

                },
                update: function() {

                }
            });

            return AppearanceSystem;
        }
    ]);
