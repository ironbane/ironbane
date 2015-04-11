angular
    .module('engine.entity-builder', [
        'ces',
        'three',
        'engine.geometry-cache',
        'engine.material-cache',
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
                    var entity = new Entity(),
                        geometry, material;

                    // we need to wrap all of these inside an Entity even tho they are basically the same
                    // because we can't change their parent class, and they themselves might be an Entity
                    // base on userData
                    switch (data.type) {
                        case 'Scene':
                            entity.add(new THREE.Scene());
                            break;

                        case 'PerspectiveCamera':
                            entity.add(new THREE.PerspectiveCamera(data.fov, data.aspect, data.near, data.far));
                            break;

                        case 'OrthographicCamera':
                            entity.add(new THREE.OrthographicCamera(data.left, data.right, data.top, data.bottom, data.near, data.far));
                            break;

                        case 'AmbientLight':
                            entity.add(new THREE.AmbientLight(data.color));
                            break;

                        case 'DirectionalLight':
                            entity.add(new THREE.DirectionalLight(data.color, data.intensity));
                            break;

                        case 'PointLight':
                            entity.add(new THREE.PointLight(data.color, data.intensity, data.distance));
                            break;

                        case 'SpotLight':
                            entity.add(new THREE.SpotLight(data.color, data.intensity, data.distance, data.angle, data.exponent));
                            break;

                        case 'HemisphereLight':
                            entity.add(new THREE.HemisphereLight(data.color, data.groundColor, data.intensity));
                            break;

                        case 'Mesh':
                            geometry = geometries[data.geometry];
                            material = materials[data.material];

                            if (geometry === undefined) {
                                $log.debug('EntityBuilder: Undefined geometry ' + data.geometry);
                            }

                            if (material === undefined) {
                                $log.debug('EntityBuilder: Undefined material ' + data.material);
                            }

                            entity.add(new THREE.Mesh(geometry, material));
                            break;

                        case 'Sprite':
                            material = materials[data.material];
                            if (material === undefined) {
                                $log.debug('EntityBuilder: Undefined material ' + data.material);
                            }

                            entity.add(new THREE.Sprite(material));
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
                            $log.debug('[EntityBuilder] Error Loading Prefab: ', prefabFactoryName, ' ERR: ', err); //, data);
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
