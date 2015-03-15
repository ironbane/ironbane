angular.module('components.scene.helper', ['ces', 'three', 'engine.texture-loader'])
    .config(function ($componentsProvider) {
        'use strict';

        $componentsProvider.addComponentData({
            'helper': {
                line: false
            }
        });
    })
    .factory('HelperSystem', function (System, THREE, TextureLoader) {
        'use strict';

        var HelperSystem = System.extend({
            addedToWorld: function (world) {
                var sys = this;

                sys._super(world);

                world.entityAdded('helper').add(function (entity) {
                    var helperData = entity.getComponent('helper'),
                        helper;

                    if (helperData.line) {
                        var lineGeo = new THREE.Geometry();
                        lineGeo.vertices.push(
                            new THREE.Vector3(0, 0, 0),
                            new THREE.Vector3(0, 0, -1)
                        );
                        var lineMat = new THREE.LineBasicMaterial({
                            color: 0xff00ff,
                            linewidth: 5
                        });

                        helper = new THREE.Line(lineGeo, lineMat);
                        helper.type = THREE.Lines;

                        helperData.helper = helper;
                        entity.add(helper);
                    }

                });
            },
            update: function () {
                var world = this.world;
            }
        });

        return HelperSystem;
    });
