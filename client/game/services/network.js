angular
    .module('game.network', [
        'ces',
        'three',
        'ui.router',
        'game.world-root',
        'engine.entity-builder',
        'engine.entity-cache',
        'engine.util'
    ])
    .service('Network', [
        'World',
        'THREE',
        '$log',
        'EntityBuilder',
        '$rootWorld',
        'Util',
        '$entityCache',
        '$state',
        function(World, THREE, $log, EntityBuilder, $rootWorld, Util, $entityCache, $state) {
            'use strict';

            var self = {};

            // TODO: use cells like in old IB by leveraging Meteor's filtering using Session
            // e.g. Meteor.subscribe("chat", {room: Session.get("current-room")});

            self.init = function() {

                Util.waitForMeteorGuestUserLogin(function() {
                    Tracker.autorun(function() {
                        var cursor = Entities.find({
                            active: true,
                            level: Session.get('activeLevel')
                        });

                        cursor.observe({
                            added: function(doc) {
                                var user = Meteor.user();

                                if (user._id === doc.owner && $state.current.name === 'three-root.play') {

                                    // Add all the stuff to make us a real player
                                    angular.extend(doc.components, {
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
                                // For now, skip network syncing if the object came from Clara
                                else if (!doc.fromClara) {
                                    doc.components.script.scripts = doc.components.script.scripts.concat([
                                        '/scripts/built-in/network-receive.js',
                                    ]);
                                }

                                var builtEntity;

                                if (doc.fromClara) {
                                    builtEntity = EntityBuilder.load(doc);
                                } else {
                                    builtEntity = EntityBuilder.build(doc.username, doc);
                                }

                                builtEntity.doc = doc;
                                $rootWorld.addEntity(builtEntity);

                                // It's the player, tag them
                                if (user._id === doc.owner) {
                                    $entityCache.put('mainPlayer', builtEntity);
                                }
                            },
                            removed: function(doc) {

                            	var user = Meteor.user();

                                var toBeRemoved = [];

                                $rootWorld.traverse(function(node) {
                                    if (node.doc && node.doc._id === doc._id) {

                                    	// If another game session tries to log us in, they will get notified
                                    	// that someone else is already playing (us) and it will try to disconnect
                                    	// this client. When that happens, the main player will get removed here
                                    	// so we must check for it and put us back in the main menu.
                                    	// A side effect of this approach is that if your account gets hijacked
                                    	// someone can annoy you all the time by "disconnecting you" by repeatingly
                                    	// trying to log in. On the other hand this may be a good thing as it becomes
                                    	// obvious that your account got compromised. Changing your password should solve that.
		                                if (user._id === doc.owner && $state.current.name === 'three-root.play') {
		                                	$state.go('^.main-menu.enter-world');
		                                }

                                        toBeRemoved.push(node);
                                    }
                                });

                                toBeRemoved.forEach(function(node) {
                                    $rootWorld.removeEntity(node);
                                });

                            }
                        });

                        Meteor.subscribe('entities');
                    });
                });
            };

            return self;
        }
    ]);
