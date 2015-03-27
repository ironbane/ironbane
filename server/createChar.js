


Meteor.methods({
  createChar: function (options) {
	var charName = options.charName;

	var user = Meteor.user();

	// Insert a new character
	entityId = Entities.insert({
		owner: user._id,
		name: charName,
		position: (new THREE.Vector3(10, 30, 0)).serialize(),
		rotation: (new THREE.Euler()).serialize(),
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
  }
});
