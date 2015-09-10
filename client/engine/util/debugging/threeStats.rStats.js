// angular.module('engine.util.debugging.rStats.threeStatsPlugin', [])
//     .factory('threeStats', [
//         function() {
//             'use strict';

//             var threeStats = function(renderer) {
//                 var _rS = null;

//                 var _values = {
//                     'renderer.info.memory.geometries': {
//                         caption: 'Geometries'
//                     },
//                     'renderer.info.memory.textures': {
//                         caption: 'Textures'
//                     },
//                     'renderer.info.memory.programs': {
//                         caption: 'Programs'
//                     },
//                     'renderer.info.render.calls': {
//                         caption: 'Calls'
//                     },
//                     'renderer.info.render.faces': {
//                         caption: 'Faces',
//                         //over: 1000
//                     },
//                     'renderer.info.render.points': {
//                         caption: 'Points'
//                     },
//                     'renderer.info.render.vertices': {
//                         caption: 'Vertices'
//                     }
//                 };

//                 var _groups = [{
//                     caption: 'Three.js - memory',
//                     values: ['renderer.info.memory.geometries', 'renderer.info.memory.programs', 'renderer.info.memory.textures']
//                 }, {
//                     caption: 'Three.js - render',
//                     values: ['renderer.info.render.calls', 'renderer.info.render.faces', 'renderer.info.render.points', 'renderer.info.render.vertices']
//                 }];

//                 var _fractions = [];

//                 function _update() {
//                     _rS('renderer.info.memory.geometries').set(renderer.info.memory.geometries);
//                     _rS('renderer.info.memory.programs').set(renderer.info.memory.programs);
//                     _rS('renderer.info.memory.textures').set(renderer.info.memory.textures);
//                     _rS('renderer.info.render.calls').set(renderer.info.render.calls);
//                     _rS('renderer.info.render.faces').set(renderer.info.render.faces);
//                     _rS('renderer.info.render.points').set(renderer.info.render.points);
//                     _rS('renderer.info.render.vertices').set(renderer.info.render.vertices);
//                 }

//                 function _start() {}

//                 function _end() {}

//                 function _attach(r) {
//                     _rS = r;
//                 }

//                 return {
//                     update: _update,
//                     start: _start,
//                     end: _end,
//                     attach: _attach,
//                     values: _values,
//                     groups: _groups,
//                     fractions: _fractions
//                 };
//             };

//             return threeStats;
//         }
//     ]);
