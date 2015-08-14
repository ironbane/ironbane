angular
    .module('engine.textureLoader', [
        'three',
        'engine.textureCache'
    ])
    .service('TextureLoader', [
        'THREE',
        '$textureCache',
        '$q',
        '$log',
        function(THREE, $textureCache, $q, $log) {
            'use strict';

            var _textureLoader = new THREE.TextureLoader(),
                _imageLoader = new THREE.ImageLoader();

            this.load = function(src) {
                //$log.debug('TextureLoader.load: ', src);
                var cached = $textureCache.get(src),
                    deferred = $q.defer();

                if (cached) {
                    deferred.resolve(cached);
                } else {
                    _textureLoader.load(src, function(texture) {

                        // Set IB specific filters here
                        texture.magFilter = THREE.NearestFilter;
                        texture.minFilter = THREE.NearestFilter;
                        texture.wrapS = THREE.RepeatWrapping;
                        texture.wrapT = THREE.RepeatWrapping;

                        $textureCache.put(src, texture);

                        deferred.resolve(texture);
                    }, deferred.notify, deferred.reject);
                }

                return deferred.promise;
            };

            // load an array of images and mash them together
            this.loadCompositeImage = function(imageList) {

            };

            this.loadSpriteTileImage = function(spritesheet, indexH, indexV, numberOfSpritesH, numberOfSpritesV) {
                var deferred = $q.defer();

                _imageLoader.load(spritesheet, function(image) {

                    var canvas = document.createElement('canvas');

                    var spriteWidth = image.width / numberOfSpritesH;
                    var spriteHeight = image.height / numberOfSpritesV;

                    canvas.width = spriteWidth;
                    canvas.height = spriteHeight;

                    var ctx = canvas.getContext('2d');

                    ctx.drawImage(image, spriteWidth * indexH, spriteHeight * indexV, spriteWidth, spriteHeight, 0, 0, spriteWidth, spriteHeight);

                    var dataURL = canvas.toDataURL();
                    deferred.resolve(dataURL);
                }, deferred.notify, deferred.reject);

                return deferred.promise;
            };

            this.loadSpriteTileTexture = function(spritesheet, indexH, indexV, numberOfSpritesH, numberOfSpritesV) {
                var textureLoader = this;

                return textureLoader.loadSpriteTileImage(spritesheet, indexH, indexV, numberOfSpritesH, numberOfSpritesV).then(function(image) {
                    return textureLoader.load(image);
                });
            };
        }
    ]);
