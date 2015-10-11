angular
    .module('three', [])
    .factory('THREE', [
        '$window',
        function($window) {
            'use strict';

            if (Meteor.isServer) {
                return Meteor.npmRequire('three');
            }

            return $window.THREE;
        }
    ])
    .run(['THREE', function(THREE) { // monkey patch time!
        'use strict';
        var roundNumber = function(number, decimals) {
            var newnumber = new Number(number + '').toFixed(parseInt(decimals)); // jshint ignore:line
            return parseFloat(newnumber);
        };

        angular.extend(THREE.Object3D.prototype, {
            getObjectById: function(id) {
                return this.getObjectByProperty('id', id);
            },
            getObjectByName: function(name) {
                return this.getObjectByProperty('name', name);
            },
            getObjectByProperty: function(name, value) {
                if (this[name] === value) {
                    return this;
                }

                for (var i = 0, l = this.children.length; i < l; i++) {
                    var child = this.children[i];
                    var object = child.getObjectByProperty(name, value);

                    if (object !== undefined) {
                        return object;
                    }
                }

                return undefined;
            },
            // Needed for server as it's still running r69
            // TODO check if we can update server's three.js revision
            traverseAncestors: function ( callback ) {
                if ( this.parent ) {

                    callback( this.parent );

                    this.parent.traverseAncestors( callback );

                }
            }
        });

        THREE.Object3D.prototype.toJSON = function() {
            var output = {
                metadata: {
                    version: 4.3,
                    type: 'Object',
                    generator: 'ObjectExporter'
                }
            };

            //
            var geometries = {};
            var parseGeometry = function(geometry) {
                if (output.geometries === undefined) {
                    output.geometries = [];
                }

                if (geometries[geometry.uuid] === undefined) {
                    var json = geometry.toJSON();
                    delete json.metadata;
                    geometries[geometry.uuid] = json;
                    output.geometries.push(json);
                }

                return geometry.uuid;
            };

            //
            var materials = {};
            var parseMaterial = function(material) {
                if (output.materials === undefined) {
                    output.materials = [];
                }

                if (materials[material.uuid] === undefined) {
                    var json = material.toJSON();
                    delete json.metadata;
                    materials[material.uuid] = json;
                    output.materials.push(json);
                }

                return material.uuid;
            };

            //
            var parseObject = function(object) {
                var data = {};

                data.uuid = object.uuid;
                data.type = object.type;

                if (object.name !== '') {
                    data.name = object.name;
                }
                if (JSON.stringify(object.userData) !== '{}') {
                    data.userData = object.userData;
                }
                if (object.visible !== true) {
                    data.visible = object.visible;
                }

                if (object instanceof THREE.PerspectiveCamera) {
                    data.fov = object.fov;
                    data.aspect = object.aspect;
                    data.near = object.near;
                    data.far = object.far;
                } else if (object instanceof THREE.OrthographicCamera) {
                    data.left = object.left;
                    data.right = object.right;
                    data.top = object.top;
                    data.bottom = object.bottom;
                    data.near = object.near;
                    data.far = object.far;
                } else if (object instanceof THREE.AmbientLight) {
                    data.color = object.color.getHex();
                } else if (object instanceof THREE.DirectionalLight) {
                    data.color = object.color.getHex();
                    data.intensity = object.intensity;
                } else if (object instanceof THREE.PointLight) {
                    data.color = object.color.getHex();
                    data.intensity = object.intensity;
                    data.distance = object.distance;
                    data.decay = object.decay;
                } else if (object instanceof THREE.SpotLight) {
                    data.color = object.color.getHex();
                    data.intensity = object.intensity;
                    data.distance = object.distance;
                    data.angle = object.angle;
                    data.exponent = object.exponent;
                    data.decay = object.decay;
                } else if (object instanceof THREE.HemisphereLight) {
                    data.color = object.color.getHex();
                    data.groundColor = object.groundColor.getHex();
                } else if (object instanceof THREE.Mesh || object instanceof THREE.Line || object instanceof THREE.PointCloud) {
                    data.geometry = parseGeometry(object.geometry);
                    data.material = parseMaterial(object.material);
                    if (object instanceof THREE.Line) {
                        data.mode = object.mode;
                    }
                } else if (object instanceof THREE.Sprite) {
                    data.material = parseMaterial(object.material);
                }

                data.matrix = object.matrix.toArray();

                if (object.children.length > 0) {
                    data.children = [];

                    for (var i = 0; i < object.children.length; i++) {
                        data.children.push(parseObject(object.children[i]));
                    }
                }

                return data;
            };

            output.object = parseObject(this);

            return output;
        };

        THREE.Vector3.prototype.inRangeOf = function(vector, range) {
            return vector.clone().sub(this).lengthSq() < range*range;
        };

        THREE.Vector3.prototype.serialize = function() {
            return [roundNumber(this.x, 2), roundNumber(this.y, 2), roundNumber(this.z, 2)];
        };

        THREE.Euler.prototype.serialize = function() {
            return [roundNumber(this.x, 2), roundNumber(this.y, 2), roundNumber(this.z, 2)];
        };

        THREE.Vector3.prototype.deserialize = function(position) {
            this.x = position[0];
            this.y = position[1];
            this.z = position[2];
        };

        THREE.Euler.prototype.deserialize = function(rotation) {
            this.x = rotation[0];
            this.y = rotation[1];
            this.z = rotation[2];
        };

        // Condensed UUID for lighter network packets
        THREE.Math.generateUUID = function () {
            var str = 'xxxxxx';

            str = str.replace(/[xy]/g, function(c) {
                var rand = Math.random();
                var r = rand * 16 | 0 % 16,
                    v = c === 'x' ? r : (r & 0x3 | 0x8);

                return v.toString(16);
            });

            return str;
        };

    }]);
