// serves as the "main" world for the CES game system
/*global Stats:true*/
angular
    .module('game.world-root', [
        'ces',
        'three'
    ])
    .service('$rootWorld', [
        'World',
        'THREE',
        function(World, THREE) {
            'use strict';

            // game instance
            var _world = new World();

            _world._timing = {}; // to hold a reference in the loop

            if (Meteor.isClient) {
                _world.renderer = new THREE.WebGLRenderer();
                _world.stats = new Stats();
            } else {
                _world.renderer = null;
                _world.stats = null;
            }

            _world.scene = new THREE.Scene();

            var oldAddEntity = _world.addEntity;
            _world.addEntity = function(entity) {
                oldAddEntity.call(_world, entity);

                // only add top level ents
                if (!entity.parent) {
                    _world.scene.add(entity);
                }
            };

            var oldRemoveEntity = _world.removeEntity;
            _world.removeEntity = function(entity) {
                oldRemoveEntity.call(_world, entity);

                // do I need to check the same about top level here?...
                _world.scene.remove(entity);
            };

            _world.traverse = function(fn) {
                _world.scene.traverse(fn);
            };

            return _world;
        }
    ]);
