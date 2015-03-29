'use strict';

var entityExporter = new EntityExporter();

var fs = Npm.require('fs');
var path = Npm.require('path');
var AdmZip = Meteor.npmRequire('adm-zip');
var walk = Meteor.npmRequire('walkdir');
var mkdirp = Meteor.npmRequire('mkdirp');
var Q = Meteor.npmRequire('q');
var curl = Meteor.npmRequire('curlrequest');

var claraUser = JSON.parse(Assets.getText('clara.json'));

var claraOptions = function (url, encoding) {
	return {
		url: url,
		'user': claraUser.name + ':' + claraUser.apiKey,
		encoding: encoding
	};
};

var meteorBuildPath = path.resolve('.') + '/';
var meteorRootProjectPath = meteorBuildPath.split('.meteor')[0];

World.importZoneFromClara = function (scene) {
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

			return Q.all(promises).then(function () {
				console.log('All done.');
				deferred.resolve();
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
							var ibEntitiesFilepath = path.dirname(filePath) + '/ib-entities.json';
							// var ibEntitiesServerFilepath = path.dirname(filePath) + '/ib-entities-server.json';

							// console.log(filePath, ibWorldFilepath, meteorRootProjectPath + filePath, claraExportFilepath);

							fs.renameSync(filePath, claraExportFilepath);

							console.log('test1');

							var claraExportJson = JSON.parse(fs.readFileSync(claraExportFilepath, 'utf8'));
							var ibWorld = postProcessWorld(claraExportJson);

							console.log('test2');

							Q.all([
								saveProcessedWorld(claraExportJson, path.dirname(filePath) + '/clara-export-test.json'),
								saveProcessedWorld(ibWorld.worldMesh, ibWorldFilepath),
								// saveProcessedEntities(ibWorld.entities, ibEntitiesFilepath)
							]).then(deferred.resolve, deferred.reject).then(function () {
								fs.unlink(zipFilepath, function (err) {
									if (err) {
										throw err;
									}
								});
								fs.unlink(claraExportFilepath, function (err) {
									if (err) {
										throw err;
									}
								});
							});
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

		var entitiesCollection = new THREE.Object3D(),
			ents = [];

		entitiesCollection.name = 'Entities';

		obj.traverse(function (child) {
			if (child.userData.entity) {
				if (obj.userData.entity) {
					// Only if the parent is an entity, we save the uuid
					// Otherwise it would be no use since the parent will be merged into one world mesh
					child.parentUuid = obj.uuid;
				}
				child.updateMatrixWorld(true);
				// store to array for later (don't mess with the tree during traversal)
				if(child.parent === obj) {
					// only push in parent ents, don't want parent jacking later...
					ents.push(child);
				}
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

					// computeCentroids(mergedMeshesGeometry);
				}
			}
		});

		ents.forEach(function (entity) {
			entitiesCollection.add(entity);
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
		var deferred = Q.defer(),
			exporter = new THREE.SceneExporter();
			// parsedWorld = exporter.parse(world);

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

	var saveProcessedEntities = function(object, savePath) {
		var deferred = Q.defer(),
			exporter = new THREE.SceneExporter(),
			parsed = exporter.parse(object);

		fs.writeFile(savePath, JSON.stringify(parsed, null, 4), function(err) {
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
