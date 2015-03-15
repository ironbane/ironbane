angular.module('engine.material-loader', ['three', 'engine.texture-loader', 'engine.material-cache'])
    .service('MaterialLoader', function (THREE, TextureLoader, $materialCache, $q) {
        'use strict';

        this.load = function (materialName, options) {
            var cached = $materialCache.get(materialName),
                deferred = $q.defer(),
                material;

            if (cached) {
                deferred.resolve(cached);
            } else if(options) {
                angular.extend(options, {name: materialName});

                // TODO: convert other options into proper types like colors and vectors

                switch (options.type) {
                    // TODO: other material types
                    case 'phong':
                        material = new THREE.MeshPhongMaterial(options);
                        $materialCache.put(materialName, material);
                        break;
                    case 'lambert':
                        material = new THREE.MeshLambertMaterial(options);
                        $materialCache.put(materialName, material);
                        break;
                    default:
                        material = new THREE.MeshBasicMaterial(options);
                        $materialCache.put(materialName, material);
                        break;
                }

                // need to load the texture separately
                if(options.texture) {
                    TextureLoader.load(options.texture)
                        .then(function(texture) {
                            material.map = texture;

                            deferred.resolve(material);
                        }, deferred.reject);
                } else {
                    deferred.resolve(material);
                }
            } else {
                deferred.reject('Cannot create material');
            }

            return deferred.promise;
        };
    });
