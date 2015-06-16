angular
    .module('game.systems.light', [
        'ces',
        'three'
    ])
    .factory('LightSystem', [
        'System',
        'THREE',
        '$log',
        function(System, THREE, $log) {
            'use strict';

            var LIGHTS = ['PointLight', 'DirectionalLight', 'SpotLight', 'AmbientLight', 'HemisphereLight'];

            var LightSystem = System.extend({
                addedToWorld: function(world) {
                    var sys = this;

                    sys._super(world);

                    world.entityAdded('light').add(function(entity) {
                        var lightData = entity.getComponent('light'),
                            light;

                        if (LIGHTS.indexOf(lightData.type) === -1) {
                            throw new TypeError('Invalid light type!');
                        }

                        switch (lightData.type) {
                            case 'DirectionalLight':
                                light = new THREE.DirectionalLight(lightData.color, lightData.intensity);

                                if (entity.name === 'ShadowLight') {
                                	light.intensity = 0;
									light.castShadow = true;
									light.onlyShadow = true;
									light.shadowDarkness = 0.4;
									light.shadowMapWidth = 2048;
									light.shadowMapHeight = 2048;
								}
                                break;
                            case 'PointLight':
                                light = new THREE.PointLight(lightData.color, lightData.intensity, lightData.distance);
                                break;
                            case 'SpotLight':
                                light = new THREE.SpotLight(lightData.color, lightData.intensity, lightData.distance, lightData.angle, lightData.exponent);
                                break;
                            case 'AmbientLight':
                                light = new THREE.AmbientLight(lightData.color);
                                break;
                            case 'HemisphereLight':
                                light = new THREE.HemisphereLight(lightData.skyColor, lightData.groundColor, lightData.intensity);
                                break;
                        }

                        if (angular.isDefined(lightData.visible)) {
                            light.visible = lightData.visible;
                        }

                        if (!entity.visible) {
                            light.visible = false;
                        }

                        lightData._light = light;
                        //$log.debug('building light: ', lightData, light);
                        entity.add(light);
                    });
                },
                update: function() {
                    // nothing
                }
            });

            return LightSystem;
        }
    ]);
