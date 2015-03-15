angular
    .module('components.scene.name-mesh', [
        'ces',
        'three',
        'engine.texture-loader'
    ])
    .config(function ($componentsProvider) {
        'use strict';

        $componentsProvider.addComponentData({
            'name-mesh': {
                text: 'name',
                color: '#FFFFFF',
                stroke: '#000000',
                fontsize: 18,
                fontface: 'Arial Black'
            }
        });
    })
    .factory('NameMeshSystem', function (System, THREE, TextureLoader, $log) {
        'use strict';

        var NameMeshSystem = System.extend({
            addedToWorld: function (world) {
                var sys = this;

                sys._super(world);

                world.entityAdded('name-mesh').add(function (entity) {
                    var canvas = document.createElement('canvas'),
                        ctx = canvas.getContext('2d'),
                        component = entity.getComponent('name-mesh');

                    ctx.font = 'Bold ' + component.fontsize + 'px ' + component.fontface;

                    // get size data (height depends only on font size)
                    var metrics = ctx.measureText(component.text);
                    var textWidth = metrics.width;

                    ctx.fillStyle = component.color;
                    ctx.strokeStyle = component.stroke;

                    ctx.fillText(component.text, 0, component.fontsize);

                    // canvas contents will be used for a texture
                    var texture = new THREE.Texture(canvas);
                    texture.needsUpdate = true;
                    var spriteMaterial = new THREE.SpriteMaterial({
                        map: texture
                    });
                    var sprite = new THREE.Sprite(spriteMaterial);
                    spriteMaterial.needsUpdate = true;

                    entity.add(sprite);

                    // place above entity TODO: test size of entity, for now assume player
                    sprite.position.y = 0.15;
                    sprite.position.x = 0.35;
                });

                world.entityRemoved('name-mesh').add(function (entity) {
                    // not sure if we need anything here
                });
            },
            update: function () {
                // no update behavior needed
            }
        });

        return NameMeshSystem;
    });
