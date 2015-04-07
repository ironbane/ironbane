angular
    .module('engine.entity-builder', [
        'ces',
        'three',
        'engine.geometry-cache',
        'engine.material-cache'
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
                    entity.addComponent($components.get(componentName, componentData));
                });

                return entity;
            };

            // load from ib-entities.json export
            this.load = function(entityData) {
                var builder = this;

                function parse(data) {
                    //$log.debug('Parsing entity data: ', data);

                    if (data.prefab) {
                        var prefabFactoryName = data.prefab + 'Prefab', // naming convention for DI
                            prefabFactory;

                        try {
                            prefabFactory = $injector.get(prefabFactoryName);
                        } catch (err) {
                            $log.debug('EntityBuilder No Such Prefab: ', prefabFactoryName);
                        }

                        //$log.debug('Got Prefab: ', prefabFactoryName, prefabFactory, root);

                        if (prefabFactory) {
                            if (angular.isFunction(prefabFactory)) {
                                // if the prefab object is a function, then it should produce
                                // the needed data
                                angular.extend(data, prefabFactory(data));
                            } else {
                                // else assume the prefab obj is just a JSON (Constant)
                                angular.extend(data, prefabFactory);
                            }
                            // TODO: maybe clean up some vars like "prefab"
                        }
                    } else {
                        // special handling for models
                        // TODO: handle more of this during the original parse
                        if (data.components && data.components.model) {
                            var geoData = data.components.model.geometry;
                            var matData = data.components.model.material;

                            // these get cached just so other services don't have to pass the whole JSON file around
                            $geometryCache.put(geoData.uuid, geoData);
                            $materialCache.put(matData.uuid, matData);
                        }
                    }

                    // build the entity
                    var entity = builder.build(data.name, data);

                    if (data.children) {
                        angular.forEach(data.children, function(child) {
                            entity.add(parse(child));
                        });
                    } else {
                        return entity;
                    }
                }

                return parse(entityData);
            };
        }
    ]);
