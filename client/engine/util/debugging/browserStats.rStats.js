// angular.module('engine.util.debugging.rStats.browserStatsPlugin', [])
//     .factory('browserStats', [
//         function() {
//             'use strict';

//             /*
//              *   From https://github.com/paulirish/memory-stats.js
//              */
//             var BrowserStats = function() {
//                 var _rS = null;

//                 var _usedJSHeapSize = 0,
//                     _totalJSHeapSize = 0;

//                 if (window.performance && !performance.memory) {
//                     performance.memory = {
//                         usedJSHeapSize: 0,
//                         totalJSHeapSize: 0
//                     };
//                 }

//                 if (performance.memory.totalJSHeapSize === 0) {
//                     console.warn('totalJSHeapSize === 0... performance.memory is only available in Chrome .')
//                 }

//                 function _h(f, c) {
//                     return function() {
//                         c.apply(this, arguments);
//                         f.apply(this, arguments);
//                     };
//                 }

//                 var _values = {
//                     memory: {
//                         caption: 'Used Memory',
//                         average: true,
//                         avgMs: 1000,
//                         over: 22
//                     },
//                     total: {
//                         caption: 'Total Memory'
//                     }
//                 };

//                 var _groups = [{
//                     caption: 'Browser',
//                     values: ['memory', 'total']
//                 }];

//                 var _fractions = [{
//                     base: 'total',
//                     steps: ['memory']
//                 }];

//                 function _size(v) {
//                     var precision = Math.pow(10, 2);
//                     var i = Math.floor(Math.log(v) / Math.log(1024));
//                     return Math.round(v * precision / Math.pow(1024, i)) / precision; // + ' ' + sizes[i];
//                 }

//                 function _update() {
//                     _usedJSHeapSize = _size(performance.memory.usedJSHeapSize);
//                     _totalJSHeapSize = _size(performance.memory.totalJSHeapSize);

//                     _rS('memory').set(_usedJSHeapSize);
//                     _rS('total').set(_totalJSHeapSize);
//                 }

//                 function _start() {
//                     _usedJSHeapSize = 0;
//                 }

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

//             return BrowserStats;
//         }
//     ]);
