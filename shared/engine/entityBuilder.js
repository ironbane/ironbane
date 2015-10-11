angular
    .module('engine.entity-builder', [
        'ces',
        'three',
        'engine.geometryCache',
        'engine.materialCache',
        'services.contentLoader',
        'prefabs'
    ])
    .service('EntityBuilder', [
        'Entity',
        'THREE',
        '$geometryCache',
        '$materialCache',
        '$injector',
        '$log',
        '$q',
        'ContentLoader',
        function(Entity, THREE, $geometryCache, $materialCache, $injector, $log, $q, ContentLoader) {
            'use strict';

            var objectLoader = new THREE.ObjectLoader();

            function addPrefabToEntity(prefabName, entity, originalConfigData) {
                if (prefabName) {
                    var prefabFactoryName = prefabName + 'Prefab', // naming convention for DI
                        prefabFactory;

                    var componentData = {};

                    // Check if the prefab can be found in the spreadsheet
                    // These are usually NPC's and thus can only be added through the server
                    if (Meteor.isServer && ContentLoader.hasNPCPrefab(prefabName)) {
                        angular.extend(componentData, ContentLoader.getNPCPrefab(prefabName));
                    }
                    else {
                        try {
                            prefabFactory = $injector.get(prefabFactoryName);
                        } catch (err) {
                            $log.debug('[EntityBuilder] Error Loading Prefab: ', prefabFactoryName, ' ERR: ', err.message);
                        }

                        if (prefabFactory) {
                            if (angular.isFunction(prefabFactory)) {
                                // if the prefab entity is a function, then it should produce
                                // the needed data
                                angular.extend(componentData, prefabFactory(originalConfigData));
                            } else {
                                // else assume the prefab obj is just a JSON (Constant)
                                angular.extend(componentData, prefabFactory);
                            }
                        }
                    }

                    // now actually add the components
                    angular.forEach(componentData.components, function(cData, componentName) {
                        entity.addComponent(componentName, cData);
                    });

                    // Because it has a prefab attached, it's dynamic.
                    // Make sure the server will send information to the clients
                    // about this entity.
                    if (Meteor.isServer && ['SpawnZone', 'DamageZone'].indexOf(prefabName) === -1) {
                        entity.addComponent('netSend');
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

                    json.images.forEach(function(img) {
                        if (!img.originalUrl) {
                            console.error('EntityBuilder: image originalUrl not set!')
                        }
                    });

                    images = objectLoader.parseImages(json.images, function() {
                        deferred.resolve(entity);
                    });
                    textures = objectLoader.parseTextures(json.textures, images);


                    _.each(textures, function (t) {
                        // Fix for some clients getting blurry textures. This shouldn't be set to 16 anyway (needs more GPU power)
                        t.anisotropy = 1;

                        // Pixelated when nearby, mipmap linear when far (easier on the eyes, especially for pixelated textures)
                        if (t.name.indexOf('Lightmap') === -1) {
                            t.minFilter = THREE.NearestMipMapLinearFilter;
                            t.magFilter = THREE.NearestFilter;
                        }
                    });

                    materials = objectLoader.parseMaterials(json.materials, textures);
                } else {
                    materials = objectLoader.parseMaterials(json.materials);
                    setTimeout(function() {
                        deferred.resolve(entity);
                    }, 0);
                }
                //$log.debug('materials: ', materials);
                entity = this.parseEntity(json.object);
                entity = this.postProcessEntity(entity, geometries, materials, sceneName);
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
                    transform = data.position ? {
                        position: data.position,
                        rotation: data.rotation,
                        scale: data.scale
                    } : data.matrix;

                entity.name = name;

                if (data.metadata) {
                    entity.metadata = data.metadata;
                }

                if (data.level) {
                    entity.level = data.level;
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
                    entity.addComponent(componentName, componentData);
                });

                addPrefabToEntity((data.userData.entity || data.userData.prefab), entity, data);

                return entity;
            };

            // this is modified from THREE.ObjectLoader (can't monkey patch)
            this.parseEntity = (function() {
                var matrix = new THREE.Matrix4();

                return function(data) {
                    var entity = new Entity();

                    entity.uuid = data.uuid.substr(0, 5);

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
                        _.each(data.children, function(child) {
                            // On the client, only load objects that do not have a prefab associated
                            // We only want to load static objects over JSON
                            // Objects with Prefabs are assumed to be dynamic so we
                            // defer loading them to the network stream
                            var canAdd = true;

                            if (child.children) {
                                _.each(child.children, function(child) {
                                    if (child.userData && child.userData.prefab) {
                                        if (!_.isUndefined(child.userData.loadOnClient) && child.userData.loadOnClient === false) {
                                            if (Meteor.isClient) {
                                                canAdd = false;
                                            }
                                        }
                                        if (!_.isUndefined(child.userData.loadOnServer) && child.userData.loadOnServer === false) {
                                            if (Meteor.isServer) {
                                                canAdd = false;
                                            }
                                        }
                                    }
                                });
                            }

                            if (canAdd) {
                                var childEntity = this.parseEntity(child);
                                entity.add(childEntity);
                            }

                        }, this);
                    }

                    return entity;
                };
            })();


            this.postProcessEntity = function(entity, geometries, materials, sceneName) {

                var data = entity.data;

                entity.level = sceneName;

                switch (data.type) {
                    case 'Scene':
                        entity.addComponent('scene');
                        break;

                    case 'PerspectiveCamera':
                        entity.addComponent('camera', {
                            projection: 'perspective',
                            fov: data.fov,
                            aspect: data.aspect,
                            near: data.near,
                            far: data.far,
                            visible: angular.isDefined(data.visible) ? data.visible : true
                        });
                        break;

                    case 'OrthographicCamera':
                        entity.addComponent('camera', {
                            projection: 'orthographic',
                            left: data.left,
                            right: data.right,
                            top: data.top,
                            bottom: data.bottom,
                            near: data.near,
                            far: data.far,
                            visible: angular.isDefined(data.visible) ? data.visible : true
                        });
                        break;

                    case 'AmbientLight':
                        entity.addComponent('light', {
                            type: 'AmbientLight',
                            color: data.color,
                            visible: angular.isDefined(data.visible) ? data.visible : true
                        });
                        break;

                    case 'DirectionalLight':
                        entity.addComponent('light', {
                            type: 'DirectionalLight',
                            color: data.color,
                            intensity: data.intensity,
                            visible: angular.isDefined(data.visible) ? data.visible : true
                        });
                        break;

                    case 'PointLight':
                        entity.addComponent('light', {
                            type: 'PointLight',
                            color: data.color,
                            intensity: data.intensity,
                            distance: data.distance,
                            visible: angular.isDefined(data.visible) ? data.visible : true
                        });
                        break;

                    case 'SpotLight':
                        entity.addComponent('light', {
                            type: 'SpotLight',
                            color: data.color,
                            intensity: data.intensity,
                            distance: data.distance,
                            angle: data.angle,
                            exponent: data.exponent,
                            visible: angular.isDefined(data.visible) ? data.visible : true
                        });
                        break;

                    case 'HemisphereLight':
                        entity.addComponent('light', {
                            type: 'HemisphereLight',
                            color: data.color,
                            groundColor: data.groundColor,
                            intensity: data.intensity,
                            visible: angular.isDefined(data.visible) ? data.visible : true
                        });
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

                        entity.addComponent('mesh', {
                            geometry: data.geometry,
                            material: data.material
                        });

                        // If the mesh contains a collider, also add an octree
                        entity.parent.children.forEach(function(child) {
                            if (child.data.userData.type && child.data.userData.type.indexOf('Collider') !== -1) {
                                entity.addComponent('octree');
                            }
                        });

                        // Check if it's a navigation mesh
                        if (entity.parent.name === 'NavMesh') {
                            entity.addComponent('navMesh', {
                                sceneName: sceneName
                            });
                        }

                        break;

                    case 'Sprite':
                        if (angular.isUndefined(data.material)) {
                            $log.error('EntityBuilder: Undefined material ' + data);
                        } else {
                            $materialCache.put(data.material, materials[data.material]);
                        }

                        entity.addComponent('sprite', {
                            material: data.material
                        });
                        break;
                }

                switch (data.userData.type) {
                    case 'MeshCollider':

                        // Something to keep in mind here:
                        // The local position of the Mesh object, which we're adding
                        // the rigidBody to will always be 0,0,0 because the true position
                        // is stored one level above in the parent. The physics will work
                        // however because we're baking the physics by passing triangles
                        // to a triangleMesh inside rigidBody. Here we're applying the worldMatrix
                        // of the mesh to every vertex, so the trimesh will be correct and its
                        // position can be left at 0,0,0.
                        // This in contrast with the BoxCollider which is dependent
                        // on a position to properly align itself, hence it is added to the
                        // parent instead.

                        entity.parent.children.forEach(function(child) {
                            if (child.data.type && child.data.type === 'Mesh') {
                                child.addComponent('rigidBody', {
                                    shape: {
                                        type: 'concave'
                                    },
                                    mass: 0,
                                    group: 'level',
                                    collidesWith: ['all']
                                });
                            }
                        });

                        break;
                    case 'BoxCollider':

                        entity.traverseAncestors(function (parent) {
                            parent.updateMatrixWorld(true);
                        })

                        var worldScale = entity.parent.getWorldScale();
                        var worldRotation = entity.parent.getWorldQuaternion();

                        entity.parent.addComponent('rigidBody', {
                            shape: {
                                type: 'box',
                                width: data.userData.size[0]*worldScale.x,
                                height: data.userData.size[1]*worldScale.y,
                                depth: data.userData.size[2]*worldScale.z
                            },
                            offset: (new THREE.Vector3()).fromArray(data.userData.center)
                                .multiply(worldScale)
                                .applyQuaternion(worldRotation),
                            mass: 0,
                            group: 'level',
                            collidesWith: ['all']
                        });

                        break;
                    case 'Script':
                        addPrefabToEntity(data.userData.prefab, entity.parent, data);
                        break;
                }

                var me = this;

                entity.children.forEach(function(child) {
                    me.postProcessEntity(child, geometries, materials, sceneName);
                });

                return entity;
            };
        }
    ]);
