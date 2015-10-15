/*global Stats:true*/
angular
    .module('game.threeWorld', [
        'ces',
        'three',
        'engine.entity-builder',
        'global.constants.game'
    ])
    .factory('ThreeWorld', [
        'World',
        'THREE',
        '$http',
        '$q',
        'EntityBuilder',
        '$log',
        'IB_CONSTANTS',
        function(World, THREE, $http, $q, EntityBuilder, $log, IB_CONSTANTS) {
            'use strict';

            // takes the normal CES world and fuses it with THREE
            var ThreeWorld = World.extend({
                init: function() {
                    this._super();

                    this.name = null;

                    this._timing = {};

                    this.entityTree = null;
                    this.allEntities = null;
                    this.knownEntities = null;

                    this.loaded = false;


                    if (Meteor.isClient) {
                        this.renderer = new THREE.WebGLRenderer({
                            precision: 'lowp'
                        });
                        this.renderer.setPixelRatio(1.0);
                        this.stats = new Stats();
                    } else {
                        this.renderer = null;
                        this.stats = null;
                    }

                    this.scene = new THREE.Scene();

                    this._loadTask = $q.when();
                },
                addEntity: function(entity) {
                    this._super(entity);

                    // only add top level ents
                    if (!entity.parent) {
                        this.scene.add(entity);
                    }
                },
                removeEntity: function(entity) {
                    this._super(entity);

                    this.scene.remove(entity);
                },
                traverse: function(fn) {
                    this.scene.traverse(fn);
                },
                getLoadPromise: function () {
                    return this._loadTask;
                },
                updateEntitiesLOD: function () {

                    var world = this;

                    world.allEntities = [];

                    this.entityTree.traverse(function (entity) {
                        if (entity.parent && entity.children.length) {
                            entity._worldPosition = new THREE.Vector3().applyMatrix4(entity.matrixWorld);
                            entity.parent = null;

                            entity._size = 1.0;

                            var promise = $q.when();
                            entity.children.forEach(function (child) {
                                if (child._components.$mesh) {
                                    promise = promise
                                        .then(function () {
                                            return world.getSystem('mesh').checkIfGeoAndMatsAreThere(child._components.$mesh).then(function (data) {
                                                var geo = data.geometry;
                                                geo.computeBoundingSphere();

                                                var worldScale = entity.getWorldScale();

                                                entity._size = Math.max(entity._size, geo.boundingSphere.radius * worldScale.length());
                                            });
                                        });
                                }
                            });

                            promise.then(function () {
                                // console.log(entity.name, entity._size);

                                entity._lodDistance = 10000;

                                if (entity._size < 3) {
                                    entity._lodDistance = 50;
                                }
                                else if (entity._size < 30) {
                                    entity._lodDistance = 100;
                                }
                                else if (entity._size < 100) {
                                    entity._lodDistance = 200;
                                }

                                world.allEntities.push(entity);
                            })
                            .then(null, function(err) {
                                console.log(err.stack);
                            });

                        }
                    });

                },
                update: function (dt, elapsed, timestamp) {
                    this._super(dt, elapsed, timestamp);

                    if (Meteor.isClient && false) {
                        this.updateRange();
                    }
                },
                updateRange: function () {

                    var world = this;

                    var entitiesWithCamera = world.getEntities('camera');

                    if (entitiesWithCamera.length) {
                        var activeCamera = entitiesWithCamera[0].getComponent('camera')._camera;

                        var newlyFoundKnownEntities = [];

                        this.allEntities.forEach(function (entity) {
                            if (entity._worldPosition.inRangeOf(activeCamera.position, entity._lodDistance)) {
                                newlyFoundKnownEntities.push(entity);
                            }
                        });

                        _.each(this.knownEntities, function (knownEntity) {
                            if (!_.contains(newlyFoundKnownEntities, knownEntity)) {
                                // console.log('remove', knownEntity)
                                world.removeEntity(knownEntity);
                            }
                        });

                        _.each(newlyFoundKnownEntities, function (knownEntity) {
                            if (!_.contains(world.knownEntities, knownEntity)) {
                                // console.log('add', knownEntity)
                                world.addEntity(knownEntity);
                            }
                        });

                        world.knownEntities = newlyFoundKnownEntities;
                    }

                },
                clearNetworkEntities: function () {
                    var world = this;

                    var nodesToBeRemoved = [];

                    world.traverse(function(node) {
                        if (node.hasComponent && (node.hasComponent('netSend') || node.hasComponent('netRecv'))) {
                            nodesToBeRemoved.push(node);
                        }
                    });

                    nodesToBeRemoved.forEach(function(node) {
                        world.removeEntity(node);
                    });
                },
                load: function(sceneName) {
                    var world = this;

                    if (this.name === sceneName) {
                        // If this scene is already loading/loaded, just return
                        // that promise
                        return this._loadTask;
                    }

                    this.loaded = false;

                    var nodesToBeRemoved = [];

                    world.traverse(function(node) {
                        if (node.isLoadedFromJsonFile) {
                            nodesToBeRemoved.push(node);
                        }
                    });

                    nodesToBeRemoved.forEach(function(node) {
                        world.removeEntity(node);
                    });

                    this.name = sceneName;

                    if (Meteor.isClient) {
                        world._loadTask = world._loadTask.then(function () {
                            return $http.get('scene/' + sceneName + '/scene.json')
                                .then(function(response) {
                                    return response.data;
                                }, $q.reject);
                        });
                    } else {
                        var loadFile = function() {
                            var deferred = $q.defer(),
                                path = Meteor.npmRequire('path'),
                                fs = Meteor.npmRequire('fs'),
                                // TODO: move these filepaths to SERVER ONLY constants
                                meteorBuildPath = path.resolve('.') + '/',
                                meteorBuildPublicPath = meteorBuildPath + '../web.browser/app/',
                                scenePath = meteorBuildPublicPath + 'scene/',
                                filePath = scenePath + sceneName + '/scene.json';

                            // $log.log('loading...', filePath);

                            fs.readFile(filePath, 'utf8', function(err, data) {
                                //$log.log(sceneName, ': [err]', err, ' [data]: ', !!data);
                                if (err) {
                                    //if (err.code !== 'ENOENT') {
                                    deferred.reject(err);
                                    //}
                                } else {
                                    try {
                                        deferred.resolve(JSON.parse(data));
                                    } catch(e) {
                                        deferred.reject(e);
                                    }
                                }
                            });

                            return deferred.promise;
                        };
                        world._loadTask = loadFile();
                    }

                    world._loadTask = world._loadTask
                        .then(function(json) {
                            //$log.log('got json: ', Object.keys(json));
                            return EntityBuilder.load(json, sceneName).then(function (entityTree) {

                                world.entityTree = entityTree;

                                if (Meteor.isServer || true) {
                                    world.addEntity(entityTree);
                                }
                                else {
                                    world.updateEntitiesLOD();
                                    world.updateRange();
                                }

                                var rigidBodyLoadPromises = [];

                                if (Meteor.isClient) {
                                    var rigidBodyEntities = world.getEntities('rigidBody');
                                    rigidBodyEntities.forEach(function (rigidBodyEntity) {
                                        var rigidBodyComponent = rigidBodyEntity.getComponent('rigidBody');

                                        if (rigidBodyComponent) {
                                            rigidBodyLoadPromises.push(function () {
                                                return rigidBodyComponent.loadPromise;
                                            });
                                        }
                                    });
                                }

                                return $q.all(rigidBodyLoadPromises);
                            });
                        }, function(err) {
                            $log.error('Error loading ', sceneName, ' ERR: ', err.stack);
                            return $q.reject('Error loading ', sceneName, err);
                        })
                        .then(function () {
                            world.loaded = true;

                            return $q.when();
                        });

                    return world._loadTask;
                }
            });

            return ThreeWorld;
        }
    ]);
