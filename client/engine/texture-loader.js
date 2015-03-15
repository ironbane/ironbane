angular.module('engine.texture-loader', ['three', 'engine.texture-cache'])
    .service('TextureLoader', [
        'THREE',
        '$textureCache',
        '$q',
        function (THREE, $textureCache, $q) {
            'use strict';

            var _loader = new THREE.TextureLoader();

            this.load = function (src) {
                var cached = $textureCache.get(src),
                    deferred = $q.defer();

                if (cached) {
                    deferred.resolve(cached);
                } else {
                    _loader.load(src, function (texture) {

                        // Set IB specific filters here
                        texture.magFilter = THREE.NearestFilter;
                        texture.minFilter = THREE.NearestMipMapLinearFilter;
                        texture.wrapS = THREE.RepeatWrapping;
                        texture.wrapT = THREE.RepeatWrapping;

                        $textureCache.put(src, texture);

                        deferred.resolve(texture);
                    }, deferred.notify, deferred.reject);
                }

                return deferred.promise;
            };
        }
    ]);
