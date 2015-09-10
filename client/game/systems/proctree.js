// angular
//     .module('game.systems.proctree', [
//         'ces',
//         'three',
//         'engine.procgen.proctree'
//     ])
//     .factory('ProcTreeSystem', [
//         'THREE',
//         'System',
//         'ProcTree',
//         '$log',
//         function(THREE, System, ProcTree, $log) {
//             'use strict';
//             var ProcTreeSystem = System.extend({
//                 addedToWorld: function(world) {
//                     var sys = this;

//                     sys._super(world);

//                     world.entityAdded('proctree').add(function(entity) {
//                         var component = entity.getComponent('proctree');
//                         if (component.seed === 'random') {
//                             component.seed = parseInt(Math.random() * 10000 + 1, 10);
//                         }
//                         var tree = new ProcTree(component);
//                         var treeModel = new THREE.Object3D();
//                         var trunkModel = {
//                             'metadata': {
//                                 'formatVersion': 3.1,
//                                 'generatedBy': 'Ironbane ProcTree',
//                                 'description': 'Auto-generated from proctree.'
//                             }
//                         };

//                         trunkModel.vertices = ProcTree.flattenArray(tree.verts);
//                         trunkModel.normals = ProcTree.flattenArray(tree.normals);
//                         trunkModel.uvs = [ProcTree.flattenArray(tree.UV)];

//                         trunkModel.faces = [];
//                         for (var i = 0; i < tree.faces.length; i++) {
//                             var face = tree.faces[i];
//                             trunkModel.faces.push(0);
//                             trunkModel.faces.push(face[0]); // v1
//                             trunkModel.faces.push(face[1]); // v2
//                             trunkModel.faces.push(face[2]); // v3
//                         }

//                         var loader = new THREE.JSONLoader();
//                         var trunkMeshData = loader.parse(trunkModel);
//                         $log.debug('trunkMeshData', trunkMeshData);
//                         var trunkMesh = new THREE.Mesh(trunkMeshData.geometry, new THREE.MeshBasicMaterial({
//                             color: 0x875E00
//                         }));

//                         // TextureLoader.load('images/trees/' + component.trunkMaterial)
//                         //     .then(function (texture) {
//                         //         var material = trunkMesh.material;
//                         //         var geometry = trunkMesh.geometry;

//                         //         material.map = texture;
//                         //         material.needsUpdate = true;
//                         //         geometry.buffersNeedUpdate = true;
//                         //         geometry.uvsNeedUpdate = true;
//                         //     });

//                         var twigModel = {};
//                         twigModel.vertices = ProcTree.flattenArray(tree.vertsTwig);
//                         twigModel.normals = ProcTree.flattenArray(tree.normalsTwig);
//                         twigModel.uvs = [ProcTree.flattenArray(tree.uvsTwig)];
//                         twigModel.faces = [];
//                         for (var x = 0; x < tree.facesTwig.length; x++) {
//                             var twigFace = tree.facesTwig[x];
//                             twigModel.faces.push(0);
//                             twigModel.faces.push(twigFace[0]); // v1
//                             twigModel.faces.push(twigFace[1]); // v2
//                             twigModel.faces.push(twigFace[2]); // v3
//                         }

//                         var twigMeshData = loader.parse(twigModel);
//                         var twigMesh = new THREE.Mesh(twigMeshData.geometry, new THREE.MeshBasicMaterial({
//                             color: 0x00FF00
//                         }));
//                         /* getting webGL errors...
//                         TextureLoader.load('images/trees/' + component.twigMaterial)
//                             .then(function (texture) {
//                                 var material = twigMesh.material;
//                                 var geometry = twigMesh.geometry;

//                                 material.map = texture;
//                                 material.needsUpdate = true;
//                                 geometry.buffersNeedUpdate = true;
//                                 geometry.uvsNeedUpdate = true;
//                             });*/

//                         treeModel.add(trunkMesh);
//                         treeModel.add(twigMesh);

//                         component._treeModel = treeModel; // store reference in the component
//                         entity.add(treeModel);

//                     });
//                 },
//                 update: function() {} // override default, even tho isn't used...
//             });

//             return ProcTreeSystem;
//         }
//     ]);
