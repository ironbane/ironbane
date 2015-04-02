angular
	.module('game.scripts.network-send', [
		'components.script'
	])
	.run(['$log', 'ScriptBank', function ($log, ScriptBank) {
		'use strict';

		var NetworkSendScript = function (entity, world) {
			this.entity = entity;
			this.world = world;

			this.networkSendTimer = 0.0;
		};

		NetworkSendScript.prototype.update = function (dt, elapsed, timestamp) {

			this.networkSendTimer += dt;

			if (this.networkSendTimer > 0.5) {
				this.networkSendTimer = 0.0;

				// var user = Meteor.user();
				// Send our updated position to Meteor

				Entities.update({
					_id: this.entity.doc._id
				}, {
					$set: {
						position: this.entity.position.serialize(),
						rotation: this.entity.rotation.serialize(),
					}
				});
			}

		};

		ScriptBank.add('/scripts/built-in/network-send.js', NetworkSendScript);
	}]);
