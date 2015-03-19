angular
	.module('game.scripts.admin-controls', [
		'components.script',
		'util.name-gen'
	])
	.run(['$log', 'ScriptBank', 'FantasyNameGenerator', function ($log, ScriptBank, FantasyNameGenerator) {
		'use strict';

		var AdminControlsScript = function (entity, world) {
			this.entity = entity;
			this.world = world;
		};

		AdminControlsScript.prototype.update = function (dt, elapsed, timestamp) {

			var input = this.world.getSystem('input');

			if (input.keyboard.getKeyDown(input.KEYS._1)) {

				var genName = FantasyNameGenerator.generateName('mmo');

				Entities.insert({
					name: genName,
					position: this.entity.position.serialize(),
					rotation: this.entity.rotation.serialize(),
					components: {
	                    quad: {
	                        transparent: true,
	                        texture: 'images/characters/prefab/' + _.sample(_.range(1, 11)) + '.png'
	                    },
						'name-mesh': {
							text: genName
						},
	                    script: {
	                        scripts: [
	                            '/scripts/built-in/sprite-sheet.js',
	                        ]
	                    },
	                    shadow: {},
					}
				}, function (err) {
					if (err) {
						throw err;
					}
				});

			}

		};

		ScriptBank.add('/scripts/built-in/admin-controls.js', AdminControlsScript);
	}]);
