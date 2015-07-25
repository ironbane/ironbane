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
        '$q',
        function(Entity, THREE, $components, $geometryCache, $materialCache, $injector, $log, $q) {
            'use strict';

            var objectLoader = new THREE.ObjectLoader();

            function addPrefabToEntity(prefabName, entity, originalConfigData) {
                if (prefabName) {
                    var prefabFactoryName = prefabName + 'Prefab', // naming convention for DI
                        prefabFactory;

                    try {
                        prefabFactory = $injector.get(prefabFactoryName);
                    } catch (err) {
                        $log.debug('[EntityBuilder] Error Loading Prefab: ', prefabFactoryName, ' ERR: ', err.message);
                    }

                    if (prefabFactory) {
                        var componentData = {};
                        if (angular.isFunction(prefabFactory)) {
                            // if the prefab entity is a function, then it should produce
                            // the needed data
                            angular.extend(componentData, prefabFactory(originalConfigData));
                        } else {
                            // else assume the prefab obj is just a JSON (Constant)
                            angular.extend(componentData, prefabFactory);
                        }

                        // TODO: allow prefabs to pass back other info than components and utilize it
                        // OR convert all prefabs to just components objects and remove the top "components" tree

                        // now actually add the components
                        angular.forEach(componentData.components, function(cData, componentName) {
                            var component = $components.get(componentName, cData);
                            // might not find, could be bad/old db data
                            if (component) {
                                // console.log('add component:', component)
                                entity.addComponent(component);
                            }
                        });
                    }
                }
            }

            // this one is good for loading a three export
            this.load = function(json, sceneName) {

                // Needed if we want to load levels again, results in strange ObjectLoader errors
                // otherwise. e.g.  Undefined image
                if (Meteor.isClient) {
                    THREE.Cache.clear();
                }

                var deferred = $q.defer();

                objectLoader.texturePath = 'scene/' + sceneName + '/';

                var geometries = objectLoader.parseGeometries(json.geometries);

                var images, textures, materials, entity;

                // Needed until we have three r71 on the server
                // Right now we're stuck with r69 which doesn't have the updated objectLoader
                // so we have to make a distinction here
                if (Meteor.isClient) {
                    images = objectLoader.parseImages(json.images, function () {
                        deferred.resolve(entity);
                    });
                    textures  = objectLoader.parseTextures( json.textures, images );
                    materials = objectLoader.parseMaterials(json.materials, textures);
                }
                else {
                    materials = objectLoader.parseMaterials(json.materials);
                    setTimeout(function () {
                        deferred.resolve(entity);
                    }, 0);
                }
                //$log.debug('materials: ', materials);
                entity = this.parseEntity(json.object);
                entity = this.postProcessEntity(entity, geometries, materials);
                entity.isLoadedFromJsonFile = true;

                return deferred.promise;
            };

            // this one is handy for just building in code not from export
            this.build = function(name, data) {
                if (angular.isObject(name) && !data) {
                    data = name;
                    name = data.name;
                }

                //$log.debug('[EntityBuilder.build] ', name, ' ', data);

                // userData is required
                data.userData = data.userData || {};

                var entity = new Entity(),
                    transform = data.matrix || {
                        position: data.position,
                        rotation: data.rotation,
                        scale: data.scale
                    };

                entity.name = name;

                if (data.metadata) {
                    entity.metadata = data.metadata;
                }

                if (data.uuid) {
                    entity.uuid = data.uuid;
                }

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

                addPrefabToEntity((data.userData.entity || data.userData.prefab), entity, data);

                return entity;
            };

            // this is modified from THREE.ObjectLoader (can't monkey patch)
            this.parseEntity = (function() {
                var matrix = new THREE.Matrix4();

                return function(data) {
                    var entity = new Entity();

                    entity.uuid = data.uuid;

                    entity.data = data;

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
                    if (angular.isDefined(data.userData)) {
                        entity.userData = data.userData;
                    } else {
                        entity.userData = data.userData = {};
                    }


                    if (data.children !== undefined) {
                        for (var child in data.children) {
                            var childEntity = this.parseEntity(data.children[child]);
                            entity.add(childEntity);
                        }
                    }

                    return entity;
                };
            })();


            this.postProcessEntity = function(entity, geometries, materials) {

                var data = entity.data;

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
                            far: data.far,
                            visible: angular.isDefined(data.visible) ? data.visible : true
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
                            far: data.far,
                            visible: angular.isDefined(data.visible) ? data.visible : true
                        }));
                        break;

                    case 'AmbientLight':
                        entity.addComponent($components.get('light', {
                            type: 'AmbientLight',
                            color: data.color,
                            visible: angular.isDefined(data.visible) ? data.visible : true
                        }));
                        break;

                    case 'DirectionalLight':
                        entity.addComponent($components.get('light', {
                            type: 'DirectionalLight',
                            color: data.color,
                            intensity: data.intensity,
                            visible: angular.isDefined(data.visible) ? data.visible : true
                        }));
                        break;

                    case 'PointLight':
                        entity.addComponent($components.get('light', {
                            type: 'PointLight',
                            color: data.color,
                            intensity: data.intensity,
                            distance: data.distance,
                            visible: angular.isDefined(data.visible) ? data.visible : true
                        }));
                        break;

                    case 'SpotLight':
                        entity.addComponent($components.get('light', {
                            type: 'SpotLight',
                            color: data.color,
                            intensity: data.intensity,
                            distance: data.distance,
                            angle: data.angle,
                            exponent: data.exponent,
                            visible: angular.isDefined(data.visible) ? data.visible : true
                        }));
                        break;

                    case 'HemisphereLight':
                        entity.addComponent($components.get('light', {
                            type: 'HemisphereLight',
                            color: data.color,
                            groundColor: data.groundColor,
                            intensity: data.intensity,
                            visible: angular.isDefined(data.visible) ? data.visible : true
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

                        // If the mesh contains a collider, also add an octree
                        entity.parent.children.forEach(function(child) {
                            if (child.data.userData.type && child.data.userData.type.indexOf('Collider') !== -1) {
                                entity.addComponent($components.get('octree', {
                                }));
                            }
                        })

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

                switch (data.userData.type) {
                    case 'BoxCollider':

                        entity.parent.addComponent($components.get('rigidBody', {
                            shape: {
                                type: 'box',
                                width: data.userData.size[0],
                                height: data.userData.size[1],
                                depth: data.userData.size[2]
                            },
                            offset: (new THREE.Vector3()).fromArray(data.userData.center),
                            mass: 0
                        }));

                        break;
                    case 'Script':
                        addPrefabToEntity((data.userData.entity || data.userData.prefab), entity.parent, data);
                        break;
                }

                var me = this;

                entity.children.forEach(function(child) {
                    me.postProcessEntity(child, geometries, materials);
                });

                return entity;
            };
        }
    ]);
