angular
    .module('prefabs.monsters.rat', [])
    .constant('RatPrefab', {
        components: {
            quad: {
                transparent: true,
                charBuildData: {
                    skin: 32
                }
            },
            rigidBody: {
                shape: {
                    type: 'sphere',
                    // height: 1,
                    radius: 0.5
                },
                mass: 1,
                friction: 0,
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
                },
                group: 'npcs',
                collidesWith: ['level', 'npcs', 'otherPlayers']
            },
            // helper: {
            //     line: true
            // },
            script: {
                scripts: [
                    '/scripts/built-in/walk-animation.js',
                ]
            },
            fighter: {
                faction: 'wilderness'
            },
            shadow: {},
            health: {
                max: 3,
                value: 3
            },
            armor: {
                max: 3,
                value: 3
            },
            inventory: {
                slot0: {name: 'Cheese', type: 'food', image: 289, health: 2},
                slot1: {name: 'Rat Skin Cap', type: 'head', image: 8, invImage: 428, armor: 1},
                rhand: {name: 'Rat Claws', type: 'weapon', handedness: '1', image: 1551, damage: 1}
            },
            damageable: {},
            globalState: {
                state: 'monster'
            },
            steeringBehaviour: {}
        }
    });
