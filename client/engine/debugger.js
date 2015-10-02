angular
    .module('engine.debugger', [
        'ces',
        'three',
        'underscore',
        'game.world-root',
        'engine.entity-builder',
        'global.constants'
    ])
    .service('Debugger', [
        '_',
        '$rootWorld',
        'EntityBuilder',
        '$components',
        'THREE',
        'IB_CONSTANTS',
        function(_, $rootWorld, EntityBuilder, $components, THREE, IB_CONSTANTS) {
            'use strict';

            this.watched = {};
            this.arrowHelpers = [];

            this.watch = function(label, variable) {
                this.watched[label] = variable;
            };

            this.drawVector = function(vector, origin, color, notrack) {
                if (!IB_CONSTANTS.isDev) {
                    return;
                }

                color = color || 0x0000FF;
                origin = origin || new THREE.Vector3(0,0,0);

                var aH = new THREE.ArrowHelper(vector.clone().normalize(), origin, vector.length(), color);
                if (!notrack) {
                    this.arrowHelpers.push(aH);
                }
                $rootWorld.scene.add(aH);
            };

            this.pathLines = {};

            this.clearPath = function (id) {
                if (this.pathLines[id]) {
                    $rootWorld.scene.remove(this.pathLines[id]);
                }
            };

            this.drawPath = function (id, path) {
                if (!IB_CONSTANTS.isDev) {
                    return;
                }

                if (path && path.length) {
                    this.clearPath(id);
                    var material = new THREE.LineBasicMaterial({
                        color: 0x0000ff,
                        linewidth: 2
                    });
                    var geometry = new THREE.Geometry();
                    // Draw debug lines
                    for (var i = 0; i < path.length; i++) {
                        geometry.vertices.push(path[i]);
                    }
                    this.pathLines[id] = new THREE.Line( geometry, material );
                    $rootWorld.scene.add( this.pathLines[id] );

                    var debugPath = path;
                    for (var i = 0; i < debugPath.length; i++) {
                        geometry = new THREE.BoxGeometry( 0.3, 0.3, 0.3 );
                        var color = 0x00ffff;
                        if (i === 0) color = 0x00ff00;
                        if (i === debugPath.length-1) color = 0xff00ff;
                        var material = new THREE.MeshBasicMaterial( {color: color} );
                        var node = new THREE.Mesh( geometry, material );
                        node.position.copy(debugPath[i]);
                        this.pathLines[id].add( node );
                    }
                }
            }

            this.clear = function () {
                for (var i = 0; i < this.arrowHelpers.length; i++) {
                    $rootWorld.scene.remove(this.arrowHelpers[i]);
                }
            };

            this.inspect = function (body) {
                Meteor.call('inspect', body, function (err, obj) {
                    if (err) {
                        throw err;
                    }
                    else {
                        console.log(obj);
                    }
                });
            };

            this.$rootWorld = $rootWorld;
            this.$components = $components;
            this.EntityBuilder = EntityBuilder;

            this.get = function (serviceName) {
                return angular.element(document.body).injector().get(serviceName);
            };
        }
    ]);
