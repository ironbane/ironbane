angular
    .module('game.systems.sprite', [
        'ces',
        'three',
        'engine.textureLoader'
    ])
    .factory('SpriteSystem', [
        'System',
        'THREE',
        'TextureLoader',
        function(System, THREE, TextureLoader) {
            'use strict';

            var SpriteSystem = System.extend({
                addedToWorld: function(world) {
                    var sys = this;

                    sys._super(world);

                    world.entityAdded('sprite').add(function(entity) {
                        var spriteData = entity.getComponent('sprite'),
                            sprite;

                        sprite = new THREE.Sprite();

                        if (spriteData.texture) {
                            TextureLoader.load(spriteData.texture)
                                .then(function(texture) {
                                    sprite.material.map = texture;
                                    sprite.material.needsUpdate = true;
                                });
                        }

                        spriteData.sprite = sprite;
                        entity.add(sprite);
                    });
                },
                update: function() {
                    // none
                }
            });

            return SpriteSystem;
        }
    ]);
