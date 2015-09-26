angular
    .module('game.systems.light', [
        'ces',
        'three',
        'engine.util',
        'engine.timing'
    ])
    .factory('LightSystem', [
        'System',
        'THREE',
        '$log',
        'IbUtils',
        'Timer',
        function(System, THREE, $log, IbUtils, Timer) {
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

                        if (lightData.flicker) {
                            lightData.flickerTimer = new Timer(0.2);
                        }

                        lightData._light = light;
                        //$log.debug('building light: ', lightData, light);
                        entity.add(light);
                    });
                },
                update: function() {
                    // nothing

                    var lightEntities = this.world.getEntities('light');
                    lightEntities.forEach(function(entity) {
                        var lightComponent = entity.getComponent('light');

                        if (lightComponent) {
                            if (lightComponent.flicker && lightComponent.flickerTimer.isExpired) {
                                lightComponent.flickerTimer.reset();
                                lightComponent.flickerTimer.set(IbUtils.getRandomFloat(0, 0.2));
                                lightComponent._light.intensity = lightComponent.intensity + IbUtils.getRandomFloat(-lightComponent.intensity*0.2, lightComponent.intensity*0.2);
                            }
                        }

                    });
                }
            });

            return LightSystem;
        }
    ]);
