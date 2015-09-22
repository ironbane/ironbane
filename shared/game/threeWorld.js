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
                init: function(sceneName) {
                    this._super();

                    this.name = sceneName;

                    this._timing = {};

                    // can check on this in loops
                    this._isLoading = {};

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

                    // load any scene, or default to our own
                    sceneName = sceneName || world.name;

                    world._isLoading[sceneName] = true;

                    if (Meteor.isClient) {
                        world._loadTask = $http.get('scene/' + sceneName + '/scene.json')
                            .then(function(response) {
                                return response.data;
                            }, $q.reject);
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
                                world._isLoading[sceneName] = false;
                            });
                        }, function(err) {
                            $log.error('Error loading ', sceneName, ' ERR: ', err.stack);
                            return $q.reject('Error loading ', sceneName, err);
                        });

                    return world._loadTask;
                }
            });

            return ThreeWorld;
        }
    ]);
