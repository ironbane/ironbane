angular
	.module('game.scripts.network-receive', [
		'components.script'
	])
	.run(function ($log, ScriptBank) {
		'use strict';

		var NetworkReceiveScript = function (entity, world) {
			this.entity = entity;
			this.world = world;

			this.networkReceiveTimer = 0.0;
		};

		NetworkReceiveScript.prototype.update = function (dt, elapsed, timestamp) {

			this.networkReceiveTimer += dt;

			if (this.networkReceiveTimer > 1.0) {
				this.networkReceiveTimer = 0.0;

				// var user = Meteor.user();
				// Receive our updated position to Meteor

				var meteorEntity = Entities.findOne({
					_id: this.entity.meteorId,
				});

				if (meteorEntity) {
					this.entity.position.deserialize(meteorEntity.position);
					this.entity.rotation.deserialize(meteorEntity.rotation);
				}
			}

		};

		ScriptBank.add('/scripts/built-in/network-receive.js', NetworkReceiveScript);
	});
