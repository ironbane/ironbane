'use strict';

var validator = Meteor.npmRequire('validator');

Meteor.methods({
  createChar: function (options) {

  	options = options || {};

  	options.charName = options.charName || 'Guest';
  	options.boy = options.boy || _.random(1, 2) === 1 ? true : false;
  	options.boy = options.boy ? 'male' : 'female';
  	options.skin = options.skin || _.sample(ironbaneConstants.characterParts[options.boy].skin);
  	options.eyes = options.eyes || _.sample(ironbaneConstants.characterParts[options.boy].eyes);
  	options.hair = options.hair || _.sample(ironbaneConstants.characterParts[options.boy].hair);

	var charName = options.charName;

	if (!validator.isAlphanumeric(charName)) {
		throw new Meteor.Error('charAlphanumeric', 'Character name can only have letters and numbers.');
	}

	if (!charName || charName.length < ironbaneConstants.rules.minCharNameLength ||
		charName.length > ironbaneConstants.rules.maxCharNameLength) {
		throw new Meteor.Error('charNameLength', 'Character name must be between ' +
			ironbaneConstants.rules.minCharNameLength + ' and ' +
			ironbaneConstants.rules.maxCharNameLength + ' chars.');
	}

	if (!_.contains(ironbaneConstants.characterParts[options.boy].skin, options.skin) ||
		!_.contains(ironbaneConstants.characterParts[options.boy].eyes, options.eyes) ||
		!_.contains(ironbaneConstants.characterParts[options.boy].hair, options.hair)) {
		throw new Meteor.Error('charAppearance', 'Invalid character appearance.');
	}

	var user = Meteor.user();

	// Insert a new character
	var entityId = Entities.insert({
		owner: user._id,
		name: charName,
		position: ironbaneConstants.world.startPosition,
		rotation: ironbaneConstants.world.startRotation,
		level: ironbaneConstants.world.startLevel,
		components: {
            quad: {
                transparent: true,
                charBuildData: {
                	skin: options.skin,
                	eyes: options.eyes,
                	hair: options.hair
                }
            },
            rigidBody: {
                shape: {
                    type: 'capsule',
                    width: 0.5,
                    height: 1.0,
                    depth: 0.5,
                    radius: 0.5

                    // type: 'sphere',
                    // radius: 0.5
                },
                mass: 1,
                friction: 0.0,
                restitution: 0,
                allowSleep: false,
                lock: {
                    position: {
                        x: false,
                        y: false,
                        z: false
                    },
                    rotation: {
                        x: true,
                        y: true,
                        z: true
                    }
                }
            },
			'name-mesh': {
				text: charName
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

	return entityId;
  }
});
