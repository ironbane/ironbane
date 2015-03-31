'use strict';

// This task imports scenes from Clara, merges all geometry and uses a FaceMaterial.
// multi-id isn't supported inside clara, but it doesn't really affect performance for us since we postprocess the mesh that clara produces.

var entityExporter = new EntityExporter();

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

World.importZoneFromClara = function (scene) {

	var claraUser = JSON.parse(Assets.getText('clara.json'));

	var claraOptions = function (url, encoding) {
		return {
			url: url,
			'user': claraUser.name + ':' + claraUser.apiKey,
			encoding: encoding
		};
	};

	var deferred = Q.defer();

	var exportClaraScenes = function (sceneNameToExport) {
		curl.request(claraOptions('http://clara.io/api/users/' + claraUser.name + '/scenes'), function (err, file) {
			var promises = [];

			var json = JSON.parse(file);

			if (!sceneNameToExport) {
				// If no scene name given, export the ones declared in clara.json
				// Filter the models by the list of scenes we want to export
				json.models = _.filter(json.models, function (model) {
					return _.contains(claraUser.sceneNamesToExport, model.name);
				});
			}

			json.models.forEach(function (model) {
				var ibSceneId = model.name.toLowerCase().replace(/ /g, '-');

				if ((sceneNameToExport && sceneNameToExport === ibSceneId) || !sceneNameToExport) {
					console.log(ibSceneId);
					console.log(model.id);
					promises.push(extractWorld(ibSceneId, model.id));
				}

			});

			return Q.all(promises).then(function (ar) {
				console.log('All done.');
				deferred.resolve(ar);
			});
		});
	};

	var extractWorld = function (ibSceneId, claraSceneId) {
		var deferred = Q.defer();

		curl.request(claraOptions('http://clara.io/api/scenes/' + claraSceneId + '/export/json?zip=true', null), function (err, file) {

			var zonePath = meteorBuildPath + 'public/scene/' + ibSceneId;

			mkdirp.sync(zonePath);

			var zipFilepath = zonePath + '/clara-export.zip';

			fs.writeFile(zipFilepath, file, function (err) {
				if (err) {
					console.log(err);
				} else {
					var zip = new AdmZip(zipFilepath);
					zip.extractAllTo(zonePath, true);

					walk(zonePath, function (filePath, stat) {
						if (path.basename(filePath, '.json') === ibSceneId) {

							var claraExportFilepath = path.dirname(filePath) + '/clara-export.json';
							var ibWorldFilepath = path.dirname(filePath) + '/ib-world.json';
							var ibEntitiesFilepath = path.dirname(filePath) + '/ib-entities-test.json';

							fs.renameSync(filePath, claraExportFilepath);

							console.log(filePath, path.dirname(filePath));

							var claraExportJson = JSON.parse(fs.readFileSync(claraExportFilepath, 'utf8'));
							var ibWorld = postProcessWorld(claraExportJson);

							Q.all([
								saveProcessedWorld(ibWorld.worldMesh, ibWorldFilepath)
							]).then(function () {
								fs.unlinkSync(zipFilepath);
								fs.unlinkSync(claraExportFilepath);

								// Do checks for these on production, probably not even needed
								fse.copySync(path.dirname(filePath), path.dirname(filePath).replace('.meteor/local/build/programs/server/', ''));
							}).then(function () {
								deferred.resolve({
									name: ibSceneId,
									entities: ibWorld.entities
								});
							}, deferred.reject);
						}
					});
				}
			});

		});

		return deferred.promise;
	};

	var postProcessWorld = function (json) {
		var loader = new THREE.ObjectLoader();

		var obj = loader.parse(json);


		// Calculate centroids (gone in three r71)
		var computeCentroidPerFace = function (face, geometry) {
			face.centroid = new THREE.Vector3( 0, 0, 0 );
			face.centroid.add( geometry.vertices[ face.a ] );
			face.centroid.add( geometry.vertices[ face.b ] );
			face.centroid.add( geometry.vertices[ face.c ] );
			face.centroid.divideScalar( 3 );
		};
		var computeCentroids = function (geometry) {
			var f, fl, face;

			for ( f = 0, fl = geometry.faces.length; f < fl; f ++ ) {
				face = geometry.faces[ f ];
				computeCentroidPerFace(face, geometry);
			}
		};


		var mergedMeshesGeometry = new THREE.Geometry();
		var mergedMaterialsCollection = [];

		var entitiesCollection = [];

		obj.traverse(function (child) {
			if (child.userData.entity) {

				if (obj.userData.entity) {
					// Only if the parent is an entity, we save the uuid
					// Otherwise it would be no use since the parent will be merged into one world mesh
					child.parentUuid = obj.uuid;
				}

				child.updateMatrixWorld(true);

				// Push these straight into Meteor
				var parsedEntity = parseEntity(child);
				entitiesCollection.push(parsedEntity);
			} else {
				if (child.geometry) {
					computeCentroids(child.geometry);

					var clonedGeometry = child.geometry.clone();

					computeCentroids(clonedGeometry);

					child.updateMatrixWorld(true);

					clonedGeometry.vertices.forEach(function (v) {
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
		mergedMeshes.name = 'WorldMesh';

		return {
			worldMesh: mergedMeshes,
			entities: entitiesCollection
		};
	};

	var saveProcessedWorld = function (world, savePath) {
		var deferred = Q.defer();

		mkdirp.sync(path.dirname(savePath));

		fs.writeFile(savePath, JSON.stringify(world, null, 4), function (err) {
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

	var parseEntity = function(entity) {
		// Push straight into the Meteor entities collection!
		// console.log(entity);
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
                        geometry: object.geometry.toJSON(),
                        material: object.material.toJSON()
                    };
                } else if (object instanceof THREE.Sprite && object.userData.entity === 'sprite') {
                    data.components.sprite = {
                        material: object.material.toJSON()
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

        var parsedEntity = parseObject(entity);

		return parsedEntity;

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


if (process.env.CLARA_IMPORT) {
	Meteor.startup(function () {
		Meteor.setTimeout(function () {
			console.log('Importing zones from Clara');
			World.importZoneFromClara().then(Meteor.bindEnvironment(function (levels) {
				levels.forEach(function (level) {
					console.log(level.entities);
					Entities.remove({
						fromClara: true,
						level: level.name
					});
					level.entities.forEach(function(entity) {
						entity.fromClara = true;
						entity.level = level.name;
						entity.active = true;
						// console.log(entity);
						var id = Entities.insert(entity);
						// console.log(id);
					});
				});
			}));
		}, 500);
	});
}
