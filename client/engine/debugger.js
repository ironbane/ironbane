angular
    .module('engine.debugger', [
        'ces',
        'three',
        'underscore',
        'game.world-root',
        'engine.entity-builder'
    ])
    .service('Debugger', [
        '_',
        '$rootWorld',
        'EntityBuilder',
        '$components',
        'THREE',
        function(_, $rootWorld, EntityBuilder, $components, THREE) {
            'use strict';

            this.watched = {};
            this.arrowHelpers = [];

            this.watch = function(label, variable) {
                this.watched[label] = variable;
            };

            this.drawVector = function(vector, origin, color, notrack) {
		        color = color || 0x0000FF;
		        origin = origin || new THREE.Vector3(0,0,0);

		        var aH = new THREE.ArrowHelper(vector.clone().normalize(), origin, vector.length(), color);
                if (!notrack) {
                    this.arrowHelpers.push(aH);
                }
		        $rootWorld.scene.add(aH);
		    };

		    this.clear = function () {
				for (var i = 0; i < this.arrowHelpers.length; i++) {
					$rootWorld.scene.remove(this.arrowHelpers[i]);
				};
		    };

            this.$rootWorld = $rootWorld;
            this.$components = $components;
            this.EntityBuilder = EntityBuilder;
        }
    ]);
