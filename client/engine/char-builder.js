'use strict';

angular
	.module('engine.char-builder', [

	])
	.service('CharBuilder', ['$q', function ($q) {

		var loadImage = function (url) {
			var deferred = $q.defer();

			var img = new Image();
			img.onload = function () {
				// ctx.drawImage(img, 0, 0); // Or at whatever offset you like
				deferred.resolve(img);
			};
			img.src = url;

			return deferred.promise;
		};

		var me = this;

		this.create = function (width, height, sprites) {

			var deferred = $q.defer();

            var canvas = document.createElement('canvas');

            canvas.width = width;
            canvas.height = height;
            // canvas.style.imageRendering = 'pixelated';

            var ctx = canvas.getContext('2d');

            var loadPromises = sprites.map(function (sprite) {
				return loadImage(sprite);
            });

            $q.all(loadPromises).then(function (images) {
            	images.forEach(function(img) {
	            	ctx.drawImage(img, 0, 0); // Or at whatever offset you like

	            	// Hack for sprites that only use 1 walking animation
	            	if (img.src.indexOf('/hair/') !== -1 ||
	            		img.src.indexOf('/head/') !== -1) {
	            		// Just draw them at the other positions
	            		ctx.drawImage(img, 16, 0);
	            		ctx.drawImage(img, 32, 0);
	            	}
            	});
            	var dataURL = canvas.toDataURL();
            	deferred.resolve(dataURL);
            });

            return deferred.promise;
		};

		this.makeChar = function (options) {
			var images = [];

			var list = ['skin', 'hair', 'eyes', 'feet', 'body', 'head'];

			list.forEach(function (part) {
				if (options[part]) {
					images.push('images/characters/' + part + '/' + options[part] + '.png');
				}
			});

			return me.create(16*3, 18*8, images);
		};

	}]);
