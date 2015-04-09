/*global Stats:true*/
angular
    .module('game.threeWorld', [
        'ces',
        'three'
    ])
    .factory('ThreeWorld', [
        'World',
        'THREE',
        function(World, THREE) {
            'use strict';

            // takes the normal CES world and fuses it with THREE
            var ThreeWorld = World.extend({
                init: function() {
                    this._super();

                    this._timing = {};

                    if (Meteor.isClient) {
                        this.renderer = new THREE.WebGLRenderer();
                        this.stats = new Stats();
                    } else {
                        this.renderer = null;
                        this.stats = null;
                    }

                    this.scene = new THREE.Scene();
                },
                addEntity: function(entity) {
                    this._super(entity);

                    // only add top level ents
                    if (!entity.parent) {
                        this.scene.add(entity);
                    }
                },
                removeEntity: function(entity) {
                    this._super(entity);

                    this.scene.remove(entity);
                },
                traverse: function(fn) {
                    this.scene.traverse(fn);
                }
            });

            return ThreeWorld;
        }
    ]);
