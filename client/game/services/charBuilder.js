angular
    .module('engine.char-builder', [])
    .service('CharBuilder', [
        '$q',
        function($q) {
            'use strict';

            var loadImage = function(url) {
                var deferred = $q.defer();

                var img = new Image();
                img.onload = function() {
                    // ctx.drawImage(img, 0, 0); // Or at whatever offset you like
                    deferred.resolve(img);
                };
                img.src = url;

                return deferred.promise;
            };

            var me = this;

            this.create = function(sprites) {
                var deferred = $q.defer();

                // canvas.style.imageRendering = 'pixelated';
                var loadPromises = sprites.map(function(sprite) {
                    return loadImage(sprite);
                });

                $q.all(loadPromises).then(function(images) {
                    var canvas = document.createElement('canvas');

                    var ctx = canvas.getContext('2d');
                    ctx.imageSmoothingEnabled = false;
                    ctx.msImageSmoothingEnabled = false;

                    var width = 0;
                    var height = 0;

                    images.forEach(function(img) {
                        if (img.src.indexOf('/skin/') !== -1) {
                            // Use as a reference
                            canvas.width = img.width;
                            canvas.height = img.height;

                            var ctx = canvas.getContext('2d');
                            ctx.imageSmoothingEnabled = false;
                            ctx.msImageSmoothingEnabled = false;

                            width = canvas.width;
                            height = canvas.height;
                        }
                    });

                    images.forEach(function(img) {


                        // Hack for sprites that only use 1 walking animation
                        if (img.src.indexOf('/hair/') !== -1 ||
                            img.src.indexOf('/head/') !== -1) {
                            // Just draw them at the other positions
                            // 48
                            ctx.drawImage(img, (width / 3) * 0, 0, width / 3, height);
                            ctx.drawImage(img, (width / 3) * 1, 0, width / 3, height);
                            ctx.drawImage(img, (width / 3) * 2, 0, width / 3, height);
                        }
                        else {
                            ctx.drawImage(img, 0, 0, width, height); // Or at whatever offset you like
                        }
                    });
                    var dataURL = canvas.toDataURL();
                    deferred.resolve(dataURL);
                });

                return deferred.promise;
            };

            this.makeChar = function(options) {
                var images = [];

                var list = ['skin', 'hair', 'eyes', 'feet', 'body', 'head'];

                list.forEach(function(part) {
                    if (options[part]) {
                        if (part === 'hair' && options.head && !options.alwaysRenderHair) {
                            // don't render hair when wearing a helmet
                        } else if (options[part] === 0) {
                            // 0 is transparent, so don't add it
                        } else {
                            images.push('images/characters/' + part + '/' + options[part] + '.png');
                        }
                    }
                });

                return me.create(images);
            };

            this.getSpriteSheetTile = function(spritesheet, indexH, indexV, numberOfSpritesH, numberOfSpritesV, mirror) {
                var deferred = $q.defer();

                loadImage(spritesheet).then(function(image) {

                    var canvas = document.createElement('canvas');

                    var spriteWidth = image.width / numberOfSpritesH;
                    var spriteHeight = image.height / numberOfSpritesV;

                    canvas.width = spriteWidth;
                    canvas.height = spriteHeight;

                    var ctx = canvas.getContext('2d');

                    ctx.drawImage(image, spriteWidth * indexH, spriteHeight * indexV, spriteWidth, spriteHeight, 0, 0, spriteWidth, spriteHeight);

                    var dataURL = canvas.toDataURL();
                    deferred.resolve(dataURL);
                });

                return deferred.promise;
            };

            this.resize = function(image, multiplier) {
                var deferred = $q.defer();

                loadImage(image).then(function(image) {

                    var canvas = document.createElement('canvas');

                    canvas.width = image.width * multiplier;
                    canvas.height = image.height * multiplier;

                    var ctx = canvas.getContext('2d');

                    ctx.imageSmoothingEnabled = false;
                    ctx.webkitImageSmoothingEnabled = false;
                    ctx.msImageSmoothingEnabled = false;

                    ctx.drawImage(image, 0, 0, canvas.width, canvas.height);

                    var dataURL = canvas.toDataURL();
                    deferred.resolve(dataURL);
                });

                return deferred.promise;
            };

        }
    ]);
