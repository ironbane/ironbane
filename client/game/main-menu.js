
angular.module('game.main-menu', [
		'ces',
		'three',
		'ui.router',
		'game.world-root',
		'engine.entity-builder'
	])
	.run(function (World, THREE, $log, EntityBuilder, $rootWorld, $state) {

		'use strict';

        var mainMenuPanningCamera = null;
        var getMainMenuPanningCamera = function () {
        	if (!mainMenuPanningCamera) {
		        mainMenuPanningCamera = EntityBuilder.build('MainMenuPanningCamera', {
		            components: {
		                camera: {
		                    aspectRatio: $rootWorld.renderer.domElement.width / $rootWorld.renderer.domElement.height
		                },
		                script: {
		                    scripts: [
		                        '/scripts/built-in/camera-pan.js'
		                    ]
		                }
		            }
		        });
	    	}

	        return mainMenuPanningCamera;
        };

        var addMainMenuCamera = function () {
        	$rootWorld.addEntity(getMainMenuPanningCamera());
        };

        var removeMainMenuCamera = function () {
        	$rootWorld.removeEntity(getMainMenuPanningCamera());
        };

		var doCheck = function () {
			var user = Meteor.user();
			if (user) {
				Tracker.autorun(function () {
					var user = Meteor.user();

					var characters = Entities.find({
						owner: user._id
					});

					if (characters.count() === 0) {
						$state.go('main-menu.play-mode');
						addMainMenuCamera();
					}
					else {
						$state.go('play');
						removeMainMenuCamera();
					}
				});
			}
			else {
				Meteor.setTimeout(doCheck, 10);
			}
		};

		Meteor.setTimeout(doCheck, 10);

	});
