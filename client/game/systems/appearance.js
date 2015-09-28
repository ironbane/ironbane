angular
    .module('game.systems.appearance', [
        'ces',
        'three',
        'engine.textureLoader',
        'engine.char-builder'
    ])
    .factory('AppearanceSystem', [
        '$log',
        'System',
        'CharBuilder',
        'TextureLoader',
        'THREE',
        function($log, System, CharBuilder, TextureLoader, THREE) {
            'use strict';

            var updateAppearance = function(entity) {
                // this only works for quads (TODO: change to something different?)
                if (!entity.hasComponent('quad')) {
                    return;
                }

                // listen to inventory system for equipment events
                var inventory = entity.getComponent('inventory'),
                    quad = entity.getComponent('quad'),
                    // TODO: make a plain old THREE class for Quad to hide some of this
                    quadWrapper = quad._quad,
                    quad1 = quadWrapper.children[0];

                //$log.debug('appearance quad: ', quad);

                var options = {};
                options.skin = quad.charBuildData.skin;
                options.hair = quad.charBuildData.hair;
                options.eyes = quad.charBuildData.eyes;
                options.body = quad.charBuildData.body;
                options.feet = quad.charBuildData.feet;
                options.head = quad.charBuildData.head;

                if (inventory.costume) {
                    options = {};
                    options.skin = inventory.costume.image;
                }
                else {
                    if (inventory.head) {
                        options.head = inventory.head.image;
                    }
                    if (inventory.body) {
                        options.body = inventory.body.image;
                    }
                    if (inventory.feet) {
                        options.feet = inventory.feet.image;
                    }
                }

                quad.__loadPromise.then(function () {
                    return CharBuilder.makeChar(options).then(function(image) {
                        return TextureLoader.load(image)
                            .then(function(loadedTexture) {
                                // TODO: something like quad.updateTexture(loadedTexture);

                                loadedTexture.minFilter = loadedTexture.magFilter = THREE.NearestFilter;
                                loadedTexture.wrapS = loadedTexture.wrapT = THREE.ClampToEdgeWrapping;
                                // loadedTexture.needsUpdate = true;
                                quad1.material.map = loadedTexture;
                                // quad1.material.emissive.set('#999'); // char is always lit to some degree
                                quad1.material.needsUpdate = true;
                                quad1.geometry.buffersNeedUpdate = true;
                                quad1.geometry.uvsNeedUpdate = true;
                                quad1.material.transparent = quad.transparent;
                                // quad1.material.transparent = false;
                                if (quad.setVisibleOnLoad) {
                                    quadWrapper.visible = true;
                                }
                            });
                    });
                });
            };

            var AppearanceSystem = System.extend({
                addedToWorld: function(world) {
                    this._super(world);

                    world.entityAdded('inventory').add(updateAppearance);

                    world.subscribe('inventory:equipItem', updateAppearance);
                    world.subscribe('inventory:onItemRemoved', updateAppearance);
                    world.subscribe('inventory:onItemAdded', updateAppearance);
                    world.subscribe('inventory:load', updateAppearance);
                },
                update: function() {

                }
            });

            return AppearanceSystem;
        }
    ]);
