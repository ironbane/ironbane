// serves as the "main" world for the CES game system
angular.module('game.network', [
		'ces',
		'three',
		'ui.router',
		'game.world-root',
		'engine.entity-builder'
	])
	.service('Network', function (World, THREE, $log, EntityBuilder, $rootWorld) {
		'use strict';

		var self = {};

		// TODO: use cells like in old IB by leveraging Meteor's filtering using Session
		// e.g. Meteor.subscribe("chat", {room: Session.get("current-room")});

		self.init = function () {

			var cursor = Entities.find({});

			cursor.observe({
				added: function (doc) {
					$log.log(doc);

					var user = Meteor.user();

					if (user._id === doc.owner) {

						// Add all the stuff to make us a real player
						angular.extend(doc.components, {
		                    rigidBody: {
		                        shape: {
		                            type: 'capsule',
		                            width: 0.5,
		                            height: 1.0,
		                            depth: 0.5,
		                            radius: 0.5

		                            // type: 'sphere',
		                            // radius: 0.5
		                        },
		                        mass: 1,
		                        friction: 0.0,
		                        restitution: 0,
		                        allowSleep: false,
		                        lock: {
		                            position: {
		                                x: false,
		                                y: false,
		                                z: false
		                            },
		                            rotation: {
		                                x: true,
		                                y: true,
		                                z: true
		                            }
		                        }
		                    },
		                    collisionReporter: {

		                    },
		                    light: {
		                        type: 'PointLight',
		                        color: 0x60511b,
		                        distance: 3.5
		                    },
		                    health: {
		                        max: 5,
		                        value: 5
		                    },
		                    camera: {
		                        aspectRatio: $rootWorld.renderer.domElement.width / $rootWorld.renderer.domElement.height
		                    }
		                });

						doc.components.script.scripts = doc.components.script.scripts.concat([
                            '/scripts/built-in/character-controller.js',
                            '/scripts/built-in/character-multicam.js',
                            '/scripts/built-in/admin-controls.js',
                            '/scripts/built-in/network-send.js',
                        ]);
					}
					else {
						doc.components.script.scripts = doc.components.script.scripts.concat([
                            '/scripts/built-in/network-receive.js',
                        ]);
					}

					var player = EntityBuilder.build('Player', doc);
					player.meteorId = doc._id;

					$rootWorld.addEntity(player);
				},
				removed: function (doc) {

					$rootWorld.traverse(function (node) {
						if (node.meteorId === doc._id) {
							$rootWorld.removeEntity(node);
						}
					});

				}
			});

			cursor.observeChanges({
				changed: function (doc, fields) {
					// $log.log(doc, fields);
				},
			});

			Meteor.subscribe('entities');
		};

		return self;
	});
