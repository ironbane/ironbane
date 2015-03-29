// exports THREE objects with specific userData into Ironbane Entity graph

EntityExporter = function () {};

EntityExporter.prototype = {
    constructor: EntityExporter,

    parse: function (object) {
        var output = {
                metadata: {
                    version: 0.1,
                    type: 'Entity',
                    generator: 'EntityExporter'
                }
            },
            geometries = {},
            materials = {};

        var parseGeometry = function (geometry) {

            if (output.geometries === undefined) {
                output.geometries = [];
            }

            if (geometries[geometry.uuid] === undefined) {
                var data = {};

                data.uuid = geometry.uuid;

                if (geometry.name !== '') {
                    data.name = geometry.name;
                }

                if (geometry instanceof THREE.PlaneGeometry) {
                    data.type = 'PlaneGeometry';
                    data.width = geometry.width;
                    data.height = geometry.height;
                    data.widthSegments = geometry.widthSegments;
                    data.heightSegments = geometry.heightSegments;
                } else if (geometry instanceof THREE.BoxGeometry) {
                    data.type = 'BoxGeometry';
                    data.width = geometry.width;
                    data.height = geometry.height;
                    data.depth = geometry.depth;
                    data.widthSegments = geometry.widthSegments;
                    data.heightSegments = geometry.heightSegments;
                    data.depthSegments = geometry.depthSegments;
                } else if (geometry instanceof THREE.CircleGeometry) {
                    data.type = 'CircleGeometry';
                    data.radius = geometry.radius;
                    data.segments = geometry.segments;
                } else if (geometry instanceof THREE.CylinderGeometry) {
                    data.type = 'CylinderGeometry';
                    data.radiusTop = geometry.radiusTop;
                    data.radiusBottom = geometry.radiusBottom;
                    data.height = geometry.height;
                    data.radialSegments = geometry.radialSegments;
                    data.heightSegments = geometry.heightSegments;
                    data.openEnded = geometry.openEnded;
                } else if (geometry instanceof THREE.SphereGeometry) {
                    data.type = 'SphereGeometry';
                    data.radius = geometry.radius;
                    data.widthSegments = geometry.widthSegments;
                    data.heightSegments = geometry.heightSegments;
                    data.phiStart = geometry.phiStart;
                    data.phiLength = geometry.phiLength;
                    data.thetaStart = geometry.thetaStart;
                    data.thetaLength = geometry.thetaLength;
                } else if (geometry instanceof THREE.IcosahedronGeometry) {
                    data.type = 'IcosahedronGeometry';
                    data.radius = geometry.radius;
                    data.detail = geometry.detail;
                } else if (geometry instanceof THREE.TorusGeometry) {
                    data.type = 'TorusGeometry';
                    data.radius = geometry.radius;
                    data.tube = geometry.tube;
                    data.radialSegments = geometry.radialSegments;
                    data.tubularSegments = geometry.tubularSegments;
                    data.arc = geometry.arc;
                } else if (geometry instanceof THREE.TorusKnotGeometry) {
                    data.type = 'TorusKnotGeometry';
                    data.radius = geometry.radius;
                    data.tube = geometry.tube;
                    data.radialSegments = geometry.radialSegments;
                    data.tubularSegments = geometry.tubularSegments;
                    data.p = geometry.p;
                    data.q = geometry.q;
                    data.heightScale = geometry.heightScale;
                } else if (geometry instanceof THREE.BufferGeometry) {
                    data.type = 'BufferGeometry';
                    data.data = bufferGeometryExporter.parse(geometry);

                    delete data.data.metadata;
                } else if (geometry instanceof THREE.Geometry) {
                    data.type = 'Geometry';
                    data.data = geometryExporter.parse(geometry);

                    delete data.data.metadata;
                } else if (geometry instanceof THREE.Geometry2) {
                    data.type = 'Geometry2';
                    data.data = geometry2Exporter.parse(geometry);

                    delete data.data.metadata;
                }

                geometries[geometry.uuid] = data;

                output.geometries.push(data);
            }

            return geometry.uuid;
        };

        var parseMaterial = function (material) {

            if (output.materials === undefined) {
                output.materials = [];
            }

            if (materials[material.uuid] === undefined) {
                var data = materialExporter.parse(material);
                delete data.metadata;

                materials[material.uuid] = data;
                output.materials.push(data);
            }

            return material.uuid;
        };

        var parseObject = function (object) {

            var data = {};

            if (object.name !== '') {
                data.name = object.name;
            }

            if (JSON.stringify(object.userData) !== '{}') {
                data.userData = object.userData;
            }

            if (object.visible !== true) {
                data.visible = object.visible;
            }

            data.matrix = object.matrix.toArray();

            data.components = {};

            // only IF this object has been marked as an entity, otherwise it's for the editor or something else
            if (object.userData && object.userData.entity) {
                if (object instanceof THREE.Scene) {
                    // scene won't be anything in Entity-Speak
                } else if (object instanceof THREE.PerspectiveCamera && object.userData.entity === 'camera') {
                    data.components.camera = {
                        projection: 'perspective',
                        fov: object.fov,
                        aspect: object.aspect,
                        near: object.near,
                        far: object.far
                    };
                } else if (object instanceof THREE.OrthographicCamera && object.userData.entity === 'camera') {
                    data.components.camera = {
                        type: 'OrthographicCamera',
                        left: object.left,
                        right: object.right,
                        top: object.top,
                        bottom: object.bottom,
                        near: object.near,
                        far: object.far
                    };
                // clara doesn't let you add ambient lights, we hack them into the scene using directional with a specific name
                } else if ((object instanceof THREE.AmbientLight && object.userData.entity === 'light') || (object.userData.entity === 'light' && object.name === 'AmbientLight')) {
                    data.components.light = {
                        type: 'AmbientLight',
                        color: object.color.getHex()
                    };
                } else if (object instanceof THREE.DirectionalLight && object.userData.entity === 'light') {
                    data.components.light = {
                        type: 'DirectionalLight',
                        color: object.color.getHex(),
                        intensity: object.intensity
                    };
                } else if (object instanceof THREE.PointLight && object.userData.entity === 'light') {
                    data.components.light = {
                        type: 'PointLight',
                        color: object.color.getHex(),
                        intensity: object.intensity,
                        distance: object.distance
                    };
                } else if (object instanceof THREE.SpotLight && object.userData.entity === 'light') {
                    data.components.light = {
                        type: 'SpotLight',
                        color: object.color.getHex(),
                        intensity: object.intensity,
                        distance: object.distance,
                        angle: object.angle,
                        exponent: object.exponent
                    };
                } else if (object instanceof THREE.HemisphereLight && object.userData.entity === 'light') {
                    data.components.light = {
                        type: 'HemisphereLight',
                        color: object.color.getHex(),
                        groundColor: object.groundColor.getHex()
                    };
                } else if (object instanceof THREE.Mesh && object.userData.entity === 'model') {
                    var modelType = object.userData.modelType || 'mesh';

                    data.components.model = {
                        type: modelType,
                        geometry: parseGeometry(object.geometry),
                        material: parseMaterial(object.material)
                    };
                } else if (object instanceof THREE.Sprite && object.userData.entity === 'sprite') {
                    data.components.sprite = {
                        material: parseMaterial(object.material)
                    };
                } else if (object.userData.entity) {
                    // this is where we are using entity templates (prefabs)
                    data.prefab = object.userData.entity;
                }
            }

            if (object.children.length > 0) {
                data.children = [];

                for (var i = 0; i < object.children.length; i++) {
                    data.children.push(parseObject(object.children[i]));
                }
            }

            return data;
        };

        output.entities = parseObject(object);
        return output;
    }
};
