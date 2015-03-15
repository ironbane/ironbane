'use strict';
/* global JSZip */

angular
    .module('components.scene.scene', [
        'ces',
        'three'
    ])
    .config(function ($componentsProvider) {

        $componentsProvider.addComponentData({
            'scene': {
                'path': ''
            }
        });
    })
    .factory('SceneSystem', function (System, THREE, $http, TextureLoader, $log, $q) {

        var SceneSystem = System.extend({
            addedToWorld: function (world) {
                var sys = this;

                sys._super(world);

                world.entityAdded('scene').add(function (entity) {
                    sys.onEntityAdded(entity);
                });
            },
            update: function () {
                // override because we have to
            },
            onEntityAdded: function (entity) {
                var component = entity.getComponent('scene');

                // these are clara.io exports
                var loader = new THREE.ObjectLoader();

                var meshTask;

                // Ravenwood is huge, zip it up!
                meshTask = $http.get('assets/scene/' + component.id + '/ib-world.zip', {
                        responseType: 'arraybuffer'
                    })
                    .then(function (response) {
                        var zip = new JSZip(response.data);
                        var worldData = JSON.parse(zip.file('ib-world.json').asText());
                        $log.debug('worldData: ', worldData);
                        return worldData;
                    }, function (err) {
                        // likely we don't have a zip file... try raw
                        return $http.get('assets/scene/' + component.id + '/ib-world.json')
                            .then(function (response) {
                                return response.data;
                            }, $q.reject); // TODO: handle errors here
                    })
                    .then(function (data) {
                        // THREE does not store material names/metadata when it recreates the materials
                        // so we need to store them here and then load the material maps ourselves

                        component.scene = loader.parse(data);

                        var originalMats = data.materials[0].materials;
                        var loadTexture = function (texName, material, geometry) {
                            return TextureLoader.load('assets/scene/' + component.id + '/' + texName + '.png')
                                .then(function (texture) {
                                    material.map = texture;
                                    material.needsUpdate = true;
                                    geometry.buffersNeedUpdate = true;
                                    geometry.uvsNeedUpdate = true;
                                });
                        };

                        for (var i = 0; i < originalMats.length; i++) {
                            if (originalMats[i].name) {
                                var texName = originalMats[i].name.split('.')[0];
                                loadTexture(texName, component.scene.material.materials[i], component.scene.geometry);

                            }
                        }

                        // Attach an octree for easy raycasting
                        entity.octree = new THREE.Octree({
                            undeferred: true,
                            useFaces: true
                        });
                        entity.octree.add(component.scene);

                        component.scene.material.needsUpdate = true;

                        entity.scene = component.scene;
                        entity.add(component.scene);
                    }, $q.reject);

                // Link the promises to the component so we can
                // wait for the mesh to load in other components
                component.meshTask = meshTask;
            },
            onEntityRemoved: function (entity) {
                // TODO
            }
        });

        return SceneSystem;
    });
