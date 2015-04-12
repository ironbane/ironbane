angular
    .module('engine.entity-builder', [
        'ces',
        'three',
        'engine.geometryCache',
        'engine.materialCache',
        'prefabs'
    ])
    .service('EntityBuilder', [
        'Entity',
        'THREE',
        '$components',
        '$geometryCache',
        '$materialCache',
        '$injector',
        '$log',
        function(Entity, THREE, $components, $geometryCache, $materialCache, $injector, $log) {
            'use strict';

            var objectLoader = new THREE.ObjectLoader();

            // this one is good for loading a three export
            this.load = function(json) {
                var geometries = objectLoader.parseGeometries(json.geometries);
                var materials = objectLoader.parseMaterials(json.materials);
                var entity = this.parseEntity(json.object, geometries, materials);

                return entity;
            };

            // this one is handy for just building in code not from export
            this.build = function(name, data) {
                var entity = new Entity(),
                    transform = data.matrix || {
                        position: data.position,
                        rotation: data.rotation,
                        scale: data.scale
                    };

                entity.name = name;

                if (angular.isArray(transform)) {
                    var matrix = new THREE.Matrix4();
                    matrix.fromArray(transform);
                    matrix.decompose(entity.position, entity.quaternion, entity.scale);
                } else if (angular.isObject(transform)) {
                    if (angular.isArray(transform.position)) {
                        entity.position.fromArray(transform.position);
                    }
                    if (angular.isArray(transform.rotation)) {
                        entity.rotation.fromArray(transform.rotation);
                    }
                    if (angular.isArray(transform.scale)) {
                        entity.scale.fromArray(transform.scale);
                    }
                }

                angular.forEach(data.components, function(componentData, componentName) {
                    var component = $components.get(componentName, componentData);
                    // might not find, could be bad/old db data
                    if (component) {
                        entity.addComponent(component);
                    }
                });

                return entity;
            };

            // this is modified from THREE.ObjectLoader (can't monkey patch)
            this.parseEntity = (function() {
                var matrix = new THREE.Matrix4();

                return function(data, geometries, materials) {
                    var entity = new Entity();

                    switch (data.type) {
                        case 'Scene':
                            entity.addComponent($components.get('scene'));
                            break;

                        case 'PerspectiveCamera':
                            entity.addComponent($components.get('camera', {
                                projection: 'perspective',
                                fov: data.fov,
                                aspect: data.aspect,
                                near: data.near,
                                far: data.far
                            }));
                            break;

                        case 'OrthographicCamera':
                            entity.addComponent($components.get('camera', {
                                projection: 'orthographic',
                                left: data.left,
                                right: data.right,
                                top: data.top,
                                bottom: data.bottom,
                                near: data.near,
                                far: data.far
                            }));
                            break;

                        case 'AmbientLight':
                            entity.addComponent($components.get('light', {
                                type: 'ambient',
                                color: data.color
                            }));
                            break;

                        case 'DirectionalLight':
                            entity.addComponent($components.get('light', {
                                type: 'directional',
                                color: data.color,
                                intensity: data.intensity
                            }));
                            break;

                        case 'PointLight':
                            entity.addComponent($components.get('light', {
                                type: 'point',
                                color: data.color,
                                intensity: data.intensity,
                                distance: data.distance
                            }));
                            break;

                        case 'SpotLight':
                            entity.addComponent($components.get('light', {
                                type: 'spot',
                                color: data.color,
                                intensity: data.intensity,
                                distance: data.distance,
                                angle: data.angle,
                                exponent: data.exponent
                            }));
                            break;

                        case 'HemisphereLight':
                            entity.addComponent($components.get('light', {
                                type: 'hemisphere',
                                color: data.color,
                                groundColor: data.groundColor,
                                intensity: data.intensity
                            }));
                            break;

                        case 'Mesh':
                            // cache the geometry and materials for later
                            if (angular.isUndefined(data.geometry)) {
                                $log.error('EntityBuilder: Undefined geometry ' + data);
                            } else {
                                $geometryCache.put(data.geometry, geometries[data.geometry]);
                            }

                            if (angular.isUndefined(data.material)) {
                                $log.error('EntityBuilder: Undefined material ' + data);
                            } else {
                                $materialCache.put(data.material, materials[data.material]);
                            }

                            entity.addComponent($components.get('mesh', {
                                geometry: data.geometry,
                                material: data.material
                            }));
                            break;

                        case 'Sprite':
                            if (angular.isUndefined(data.material)) {
                                $log.error('EntityBuilder: Undefined material ' + data);
                            } else {
                                $materialCache.put(data.material, materials[data.material]);
                            }

                            entity.addComponent($components.get('sprite', {
                                material: data.material
                            }));
                            break;
                    }

                    entity.uuid = data.uuid;

                    if (data.name !== undefined) {
                        entity.name = data.name;
                    }
                    if (data.matrix !== undefined) {
                        matrix.fromArray(data.matrix);
                        matrix.decompose(entity.position, entity.quaternion, entity.scale);
                    } else {
                        if (data.position !== undefined) {
                            entity.position.fromArray(data.position);
                        }
                        if (data.rotation !== undefined) {
                            entity.rotation.fromArray(data.rotation);
                        }
                        if (data.scale !== undefined) {
                            entity.scale.fromArray(data.scale);
                        }
                    }

                    if (data.visible !== undefined) {
                        entity.visible = data.visible;
                    }
                    if (data.userData !== undefined) {
                        entity.userData = data.userData;
                    }

                    if (data.userData.entity || data.userData.prefab) {
                        var prefabFactoryName = (data.userData.entity || data.userData.prefab) + 'Prefab', // naming convention for DI
                            prefabFactory;

                        try {
                            prefabFactory = $injector.get(prefabFactoryName);
                        } catch (err) {
                            $log.debug('[EntityBuilder] Error Loading Prefab: ', prefabFactoryName, ' ERR: ', err);
                        }

                        if (prefabFactory) {
                            var componentData = {};
                            if (angular.isFunction(prefabFactory)) {
                                // if the prefab entity is a function, then it should produce
                                // the needed data
                                angular.extend(componentData, prefabFactory(data));
                            } else {
                                // else assume the prefab obj is just a JSON (Constant)
                                angular.extend(componentData, prefabFactory);
                            }

                            // now actually add the components
                            angular.forEach(componentData, function(cData, componentName) {
                                var component = $components.get(componentName, cData);
                                // might not find, could be bad/old db data
                                if (component) {
                                    entity.addComponent(component);
                                }
                            });
                        }
                    }

                    if (data.children !== undefined) {
                        for (var child in data.children) {
                            entity.add(this.parseEntity(data.children[child], geometries, materials));
                        }
                    }

                    return entity;
                };
            })();
        }
    ]);
