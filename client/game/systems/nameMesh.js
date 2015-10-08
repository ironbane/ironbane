angular
    .module('game.systems.nameMesh', [
        'ces',
        'three'
    ])
    .factory('NameMeshSystem', [
        'System',
        'THREE',
        function(System, THREE) {
            'use strict';

            var NameMeshSystem = System.extend({
                addedToWorld: function(world) {
                    var sys = this;

                    sys._super(world);

                    world.entityAdded('name-mesh').add(function(entity) {
                        var canvas = document.createElement('canvas');

                        canvas.width = 800;
                        canvas.height = 80;
                        // canvas.style.imageRendering = 'pixelated';

                        var ctx = canvas.getContext('2d');
                        var component = entity.getComponent('name-mesh');

                        ctx.font = 'Bold ' + component.fontsize + 'px "' + component.fontface + '"';

                        ctx.textAlign = 'center';

                        ctx.fillStyle = component.color;
                        ctx.lineWidth = 8;
                        ctx.strokeStyle = component.stroke;

                        ctx.strokeText(component.text, 400, component.fontsize);
                        ctx.fillText(component.text, 400, component.fontsize);


                        // canvas contents will be used for a texture
                        var texture = new THREE.Texture(canvas);
                        texture.minFilter = texture.magFilter = THREE.NearestFilter;
                        texture.wrapS = texture.wrapT = THREE.ClampToEdgeWrapping;
                        texture.needsUpdate = true;
                        var spriteMaterial = new THREE.SpriteMaterial({
                            map: texture
                        });
                        var sprite = new THREE.Sprite(spriteMaterial);
                        spriteMaterial.needsUpdate = true;

                        sprite.scale.x = 2.0;
                        sprite.scale.y = 0.2;

                        entity.add(sprite);

                        // place above entity TODO: test size of entity, for now assume player
                        sprite.position.y = 0.6;

                        component._sprite = sprite;
                        // sprite.position.x = 0.1;
                    });

                    world.entityRemoved('name-mesh').add(function(entity) {
                        var component = entity.getComponent('name-mesh');

                        entity.remove(component._sprite);
                    });
                },
                update: function() {
                    // no update behavior needed
                }
            });

            return NameMeshSystem;
        }
    ]);
