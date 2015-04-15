angular
    .module('geometry.toJSON', ['three'])
    .run(['THREE', function(THREE) {
        'use strict';

        // Modified Geometry in order to use commented out materialIndex
        // As of 03.29.15 still unsure why they commented this out

        THREE.Geometry.prototype.toJSON = function() {
            // throw new Error('TEST');
            var output = {
                metadata: {
                    version: 4.0,
                    type: 'BufferGeometry',
                    generator: 'BufferGeometryExporter'
                },
                uuid: this.uuid,
                type: this.type
            };

            if (this.name !== '') {
                output.name = this.name;
            }

            if (this.parameters !== undefined) {
                var parameters = this.parameters;

                for (var key in parameters) {
                    if (parameters[key] !== undefined) {
                        output[key] = parameters[key];
                    }
                }

                return output;
            }

            var vertices = [];

            for (var i = 0; i < this.vertices.length; i++) {
                var vertex = this.vertices[i];
                vertices.push(vertex.x, vertex.y, vertex.z);
            }

            var faces = [];
            var normals = [];
            var normalsHash = {};
            var colors = [];
            var colorsHash = {};
            var uvs = [];
            var uvsHash = {};

            for (var i = 0; i < this.faces.length; i++) {
                var face = this.faces[i];

                var hasMaterial = face.materialIndex !== undefined;
                var hasFaceUv = false; // deprecated
                var hasFaceVertexUv = this.faceVertexUvs[0][i] !== undefined;
                var hasFaceNormal = face.normal.length() > 0;
                var hasFaceVertexNormal = face.vertexNormals.length > 0;
                var hasFaceColor = face.color.r !== 1 || face.color.g !== 1 || face.color.b !== 1;
                var hasFaceVertexColor = face.vertexColors.length > 0;

                var faceType = 0;

                faceType = setBit(faceType, 0, 0);
                faceType = setBit(faceType, 1, hasMaterial);
                faceType = setBit(faceType, 2, hasFaceUv);
                faceType = setBit(faceType, 3, hasFaceVertexUv);
                faceType = setBit(faceType, 4, hasFaceNormal);
                faceType = setBit(faceType, 5, hasFaceVertexNormal);
                faceType = setBit(faceType, 6, hasFaceColor);
                faceType = setBit(faceType, 7, hasFaceVertexColor);

                faces.push(faceType);
                faces.push(face.a, face.b, face.c);

                if (hasMaterial) {
                    faces.push(face.materialIndex);
                }


                if (hasFaceVertexUv) {
                    var faceVertexUvs = this.faceVertexUvs[0][i];

                    faces.push(
                        getUvIndex(faceVertexUvs[0]),
                        getUvIndex(faceVertexUvs[1]),
                        getUvIndex(faceVertexUvs[2])
                    );
                }

                if (hasFaceNormal) {
                    faces.push(getNormalIndex(face.normal));
                }

                if (hasFaceVertexNormal) {
                    var vertexNormals = face.vertexNormals;

                    faces.push(
                        getNormalIndex(vertexNormals[0]),
                        getNormalIndex(vertexNormals[1]),
                        getNormalIndex(vertexNormals[2])
                    );
                }

                if (hasFaceColor) {
                    faces.push(getColorIndex(face.color));
                }

                if (hasFaceVertexColor) {
                    var vertexColors = face.vertexColors;

                    faces.push(
                        getColorIndex(vertexColors[0]),
                        getColorIndex(vertexColors[1]),
                        getColorIndex(vertexColors[2])
                    );
                }
            }

            function setBit(value, position, enabled) {
                return enabled ? value | (1 << position) : value & (~(1 << position));
            }

            function getNormalIndex(normal) {
                var hash = normal.x.toString() + normal.y.toString() + normal.z.toString();

                if (normalsHash[hash] !== undefined) {
                    return normalsHash[hash];
                }

                normalsHash[hash] = normals.length / 3;
                normals.push(normal.x, normal.y, normal.z);

                return normalsHash[hash];
            }

            function getColorIndex(color) {
                var hash = color.r.toString() + color.g.toString() + color.b.toString();

                if (colorsHash[hash] !== undefined) {
                    return colorsHash[hash];
                }

                colorsHash[hash] = colors.length;
                colors.push(color.getHex());

                return colorsHash[hash];
            }

            function getUvIndex(uv) {
                var hash = uv.x.toString() + uv.y.toString();

                if (uvsHash[hash] !== undefined) {
                    return uvsHash[hash];
                }

                uvsHash[hash] = uvs.length / 2;
                uvs.push(uv.x, uv.y);

                return uvsHash[hash];
            }

            output.data = {};

            output.data.vertices = vertices;
            output.data.normals = normals;
            if (colors.length > 0) {
                output.data.colors = colors;
            }
            if (uvs.length > 0) {
                output.data.uvs = [uvs]; // temporal backward compatibility
            }
            output.data.faces = faces;
            //

            return output;
        };
    }]);
