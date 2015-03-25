angular
    .module('components.scene.name-mesh', [
        'ces',
        'three',
        'engine.texture-loader'
    ])
    .config(['$componentsProvider', function ($componentsProvider) {
        'use strict';

        $componentsProvider.addComponentData({
            'name-mesh': {
                text: 'name',
                color: '#FFFFFF',
                stroke: '#000000',
                fontsize: 52,
                fontface: 'Arial Black'
            }
        });
    }])
    .factory('NameMeshSystem', ['System', 'THREE', 'TextureLoader', '$log', function (System, THREE, TextureLoader, $log) {
        'use strict';

        var NameMeshSystem = System.extend({
            addedToWorld: function (world) {
                var sys = this;

                sys._super(world);

                world.entityAdded('name-mesh').add(function (entity) {
                    var canvas = document.createElement('canvas');

                    canvas.width = 800;
                    canvas.height = 80;
                    // canvas.style.imageRendering = 'pixelated';

                    var ctx = canvas.getContext('2d');
					var component = entity.getComponent('name-mesh');

                    ctx.font = 'Bold ' + component.fontsize + 'px ' + component.fontface;

                    // get size data (height depends only on font size)
                    var metrics = ctx.measureText(component.text);
                    var textWidth = metrics.width;

					// ctx.rect(0,0,800,80);
                    // ctx.fillStyle = 'red';
					// ctx.fill();

					ctx.textAlign = 'center';

					ctx.fillStyle = component.color;
			      	ctx.lineWidth = 3;
                    ctx.strokeStyle = component.stroke;

					ctx.fillText(component.text, 400, component.fontsize);
					ctx.strokeText(component.text, 400, component.fontsize);

                    // canvas contents will be used for a texture
                    var texture = new THREE.Texture(canvas);
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
                    // sprite.position.x = 0.1;
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
    }]);
