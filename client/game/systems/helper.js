angular
    .module('game.systems.helper', [
        'ces',
        'three'
    ])
    .factory('HelperSystem', [
        'System',
        'THREE',
        function(System, THREE) {
            'use strict';

            var HelperSystem = System.extend({
                addedToWorld: function(world) {
                    var sys = this;

                    sys._super(world);

                    world.entityAdded('helper').add(function(entity) {
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

                            helperData._helper = helper;
                            entity.add(helper);
                        }

                    });
                },
                update: function() {
                    // none
                }
            });

            return HelperSystem;
        }
    ]);
