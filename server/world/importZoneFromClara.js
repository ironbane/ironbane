/*global THREE*/
'use strict';

// This task imports scenes from Clara, merges all geometry and uses a FaceMaterial.
// multi-id isn't supported inside clara, but it doesn't really affect performance for us since we postprocess the mesh that clara produces.

var fs = Npm.require('fs');
var fse = Meteor.npmRequire('fs-extra');
var path = Npm.require('path');
var AdmZip = Meteor.npmRequire('adm-zip');
var walk = Meteor.npmRequire('walkdir');
var mkdirp = Meteor.npmRequire('mkdirp');
var Q = Meteor.npmRequire('q');
var curl = Meteor.npmRequire('curlrequest');

var meteorBuildPath = path.resolve('.') + '/';
var meteorRootProjectPath = meteorBuildPath.split('.meteor')[0];

var meteorBuildPublicPath = meteorBuildPath + '../web.browser/app/';
var meteorRootProjectPublicPath = meteorRootProjectPath + 'public/';

var importZoneFromClara = function(scene) {

    var claraUser = JSON.parse(Assets.getText('clara.json'));

    var claraOptions = function(url, encoding) {
        return {
            url: url,
            'user': claraUser.name + ':' + claraUser.apiKey,
            encoding: encoding
        };
    };

    var deferred = Q.defer();

    var exportClaraScenes = function(sceneNameToExport) {
        curl.request(claraOptions('http://clara.io/api/users/' + claraUser.name + '/scenes'), function(err, file) {
            var promises = [];

            var json = JSON.parse(file);

            if (!sceneNameToExport) {
                // If no scene name given, export the ones declared in clara.json
                // Filter the models by the list of scenes we want to export
                json.models = _.filter(json.models, function(model) {
                    return _.contains(claraUser.sceneNamesToExport, model.name);
                });
            }

            json.models.forEach(function(model) {
                var ibSceneId = model.name.toLowerCase().replace(/ /g, '-');

                if ((sceneNameToExport && sceneNameToExport === ibSceneId) || !sceneNameToExport) {
                    console.log(ibSceneId);
                    console.log(model.id);
                    promises.push(extractWorld(ibSceneId, model.id));
                }

            });

            return Q.all(promises).then(function(ar) {
                console.log('All done.');
                deferred.resolve(ar);
            });
        });
    };

    var extractWorld = function(ibSceneId, claraSceneId) {
        var deferred = Q.defer();

        curl.request(claraOptions('http://clara.io/api/scenes/' + claraSceneId + '/export/json?zip=true', null), function(err, file) {

            var zonePath = meteorRootProjectPublicPath + 'scene/' + ibSceneId;

            mkdirp.sync(zonePath);

            var zipFilepath = zonePath + '/clara-export.zip';

            fs.writeFile(zipFilepath, file, function(err) {
                if (err) {
                    console.log(err);
                } else {
                    var zip = new AdmZip(zipFilepath);
                    zip.extractAllTo(zonePath, true);

                    walk(zonePath, function(filePath) {
                        if (path.basename(filePath, '.json') === ibSceneId) {
                            var claraExportFilepath = path.dirname(filePath) + '/clara-export.json';
                            var ibWorldFilepath = path.dirname(filePath) + '/ib-world.json';

                            fs.renameSync(filePath, claraExportFilepath);

                            console.log(filePath, path.dirname(filePath));

                            var claraExportJson = JSON.parse(fs.readFileSync(claraExportFilepath, 'utf8'));
                            var ibWorld = postProcessWorld(claraExportJson);

                            var uncompressed = 0; // 4 for stringify // TODO: pull from some config? or ENV?
                            saveJson(ibWorld, ibWorldFilepath, uncompressed)
                                .then(function() {
                                    fs.unlinkSync(zipFilepath);
                                    fs.unlinkSync(claraExportFilepath);

                                    // Do checks for these on production, probably not even needed
                                    // fse.copySync(path.dirname(filePath), path.dirname(filePath).replace('.meteor/local/build/programs/server/', ''));
                                }).then(function() {
                                    deferred.resolve({
                                        name: ibSceneId,
                                        entities: ibWorld
                                    });
                                }, deferred.reject);
                        }
                    });
                }
            });

        });

        return deferred.promise;
    };

    var postProcessWorld = function(json) {
        var loader = new THREE.ObjectLoader();

        var obj = loader.parse(json);

        // Calculate centroids (gone in three r71)
        var computeCentroidPerFace = function(face, geometry) {
            face.centroid = new THREE.Vector3(0, 0, 0);
            face.centroid.add(geometry.vertices[face.a]);
            face.centroid.add(geometry.vertices[face.b]);
            face.centroid.add(geometry.vertices[face.c]);
            face.centroid.divideScalar(3);
        };

        var computeCentroids = function(geometry) {
            var f, fl, face;

            for (f = 0, fl = geometry.faces.length; f < fl; f++) {
                face = geometry.faces[f];
                computeCentroidPerFace(face, geometry);
            }
        };

        var mergedMeshesGeometry = new THREE.Geometry();
        var mergedMaterialsCollection = [];

        var entitiesCollection = [];

        obj.traverse(function(child) {
            child.updateMatrixWorld(true);

            // we basically want to pull out entities as a separate scene so they dont get merged into the world
            if (child.userData.entity || child.userData.prefab || child.hasEntityAncestor) {
                if (!child.hasEntityAncestor) { // we only want to push the first parent
                    child.traverse(function(c) {
                        // traverse also calls on itself...
                        if (c !== child) {
                            c.hasEntityAncestor = true;
                        }
                    });
                    entitiesCollection.push(child);
                }
            } else {
                if (child.geometry) {
                    computeCentroids(child.geometry);

                    var clonedGeometry = child.geometry.clone();

                    computeCentroids(clonedGeometry);

                    clonedGeometry.vertices.forEach(function(v) {
                        v.applyMatrix4(child.matrixWorld);
                    });

                    mergeMaterials(mergedMeshesGeometry, mergedMaterialsCollection, clonedGeometry, [child.material]);
                }
            }
        });

        function mergeMaterials(geometry1, materials1, geometry2, materials2) {
            var matrix, matrixRotation,
                vertexOffset = geometry1.vertices.length,
                uvPosition = geometry1.faceVertexUvs[0].length,
                vertices1 = geometry1.vertices,
                vertices2 = geometry2.vertices,
                faces1 = geometry1.faces,
                faces2 = geometry2.faces,
                uvs1 = geometry1.faceVertexUvs[0],
                uvs2 = geometry2.faceVertexUvs[0];

            var geo1MaterialsMap = {};

            for (var i = 0; i < materials1.length; i++) {
                var id = materials1[i].id;
                geo1MaterialsMap[id] = i;
            }

            // vertices
            for (var i = 0, il = vertices2.length; i < il; i++) {
                var vertex = vertices2[i];
                var vertexCopy = vertex.clone();

                if (matrix) {
                    matrix.multiplyVector3(vertexCopy);
                }

                vertices1.push(vertexCopy);
            }

            // faces
            for (i = 0, il = faces2.length; i < il; i++) {
                var face = faces2[i],
                    faceCopy, normal, color,
                    faceVertexNormals = face.vertexNormals,
                    faceVertexColors = face.vertexColors;

                faceCopy = new THREE.Face3(face.a + vertexOffset, face.b + vertexOffset, face.c + vertexOffset);
                computeCentroidPerFace(faceCopy, geometry1);

                faceCopy.normal.copy(face.normal);

                if (matrixRotation) {
                    matrixRotation.multiplyVector3(faceCopy.normal);
                }

                for (var j = 0, jl = faceVertexNormals.length; j < jl; j++) {
                    normal = faceVertexNormals[j].clone();
                    if (matrixRotation) {
                        matrixRotation.multiplyVector3(normal);
                    }

                    faceCopy.vertexNormals.push(normal);
                }

                faceCopy.color.copy(face.color);

                for (var j = 0, jl = faceVertexColors.length; j < jl; j++) {
                    color = faceVertexColors[j];
                    faceCopy.vertexColors.push(color.clone());
                }

                if (face.materialIndex !== undefined) {
                    var material2 = materials2[face.materialIndex];
                    var materialId2 = material2.id;
                    var materialIndex = geo1MaterialsMap[materialId2];

                    if (materialIndex === undefined) {
                        materialIndex = materials1.length;
                        geo1MaterialsMap[materialId2] = materialIndex;
                        materials1.push(material2);
                    }

                    faceCopy.materialIndex = materialIndex;
                }

                faceCopy.centroid.copy(face.centroid);

                if (matrix) {
                    matrix.multiplyVector3(faceCopy.centroid);
                }

                faces1.push(faceCopy);
            }

            // uvs
            for (i = 0, il = uvs2.length; i < il; i++) {
                var uv = uvs2[i],
                    uvCopy = [];

                for (var j = 0, jl = uv.length; j < jl; j++) {
                    uvCopy.push(new THREE.Vector2(uv[j].x, uv[j].y));
                }

                uvs1.push(uvCopy);
            }
        }

        var mergedMeshes = new THREE.Mesh(mergedMeshesGeometry, new THREE.MeshFaceMaterial(mergedMaterialsCollection));
        mergedMeshes.name = 'Merged Meshes';
        mergedMeshes.userData = mergedMeshes.userData || {};
        mergedMeshes.userData.prefab = 'WorldMesh';

        var finalScene = new THREE.Object3D();
        finalScene.name = obj.name || 'World';

        finalScene.add(mergedMeshes);

        // this will reparent them for the export
        entitiesCollection.forEach(function(ent) {
            finalScene.add(ent);
        });

        return finalScene;
    };

    var saveJson = function(data, savePath, uncompressed) {
        var deferred = Q.defer();

        mkdirp.sync(path.dirname(savePath));

        fs.writeFile(savePath, JSON.stringify(data, null, uncompressed), function(err) {
            if (err) {
                console.log(err);
                return deferred.reject(err);
            } else {
                console.log('Saved ' + savePath);
                return deferred.resolve();
            }
        });

        return deferred.promise;
    };

    exportClaraScenes(scene);

    // For testing...
    // var zonePath = angus.appPath + '/src/assets/scene/storage-room';
    // var claraExportJson = require(zonePath + '/clara-export.json');
    // var ibWorldFilepath = zonePath + '/ib-world.json';
    // var ibWorld = postProcessWorld(claraExportJson);
    // saveProcessedWorld(ibWorld, ibWorldFilepath);

    return deferred.promise;
};


if (process.env.TASK) {
    if (process.env.TASK === 'importlevels') {
        Meteor.startup(function() {
            Meteor.setTimeout(function() {
                console.log('Importing levels from Clara');
                importZoneFromClara();
            }, 500);
        });
    }
}
