angular.module('engine.debugger', ['engine.ib-config', 'three', 'engine.util'])
    .service('Debugger', ['IbConfig', 'THREE', 'Util', function (IbConfig, THREE, Util) {
        'use strict';


        var watched = [];
        var domElementId = IbConfig.get('debugDomElementId');

        this.watch = function (label, variable) {
        	var found = _.find(watched, function (el) {
        		return el.label === label;
        	});
        	if (!found) {
        		watched.push({ label: label, variable: variable });
        	}
        };

        var updateTimer = 0.0;

        this.tick = function (dt) {

        	updateTimer += dt;

        	if (updateTimer > 0.5) {
        		updateTimer = 0;

	            var domElement = document.getElementById(domElementId);

	            if (!domElement) {
	                return;
	            }

	            var text = '';

	            watched.forEach(function (watch) {
	                var info = watch.variable;

	                if (watch.variable instanceof THREE.Vector3) {
	                    info = 'x: ' + Util.roundNumber(watch.variable.x, 2) + ', y: ' + Util.roundNumber(watch.variable.y, 2) + ', z: ' + Util.roundNumber(watch.variable.z, 2);
	                }

	                text += watch.label + ': ' + info + '<br>';
	            });

	            domElement.innerHTML = text;

				watched = [];
        	}
        };
    }]);
