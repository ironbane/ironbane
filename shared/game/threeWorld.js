/*global Stats:true*/
angular
    .module('game.threeWorld', [
        'ces',
        'three',
        'engine.entity-builder'
    ])
    .factory('ThreeWorld', [
        'World',
        'THREE',
        '$http',
        '$q',
        'EntityBuilder',
        '$log',
        function(World, THREE, $http, $q, EntityBuilder, $log) {
            'use strict';

            // takes the normal CES world and fuses it with THREE
            var ThreeWorld = World.extend({
                init: function() {
                    this._super();

                    this.name = null;

                    this._timing = {};

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
                load: function(sceneName) {
                    var world = this;

                    if (this.name === sceneName) {
                        // If this scene is already loading/loaded, just return
                        // that promise
                        return this._loadTask;
                    }

                    if (Meteor.isClient) {
                        Session.set('levelLoaded', false);
                    }

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
                                world.addEntity(entityTree);

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
                            if (Meteor.isClient) {
                                Session.set('levelLoaded', true);
                            }

                            return $q.when();
                        });

                    return world._loadTask;
                }
            });

            return ThreeWorld;
        }
    ]);
