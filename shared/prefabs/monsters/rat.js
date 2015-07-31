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
                collidesWith: ['level']
            },
            // helper: {
            //     line: true
            // },
            script: {
                scripts: [
                    '/scripts/built-in/walk-animation.js',
                ]
            },
            health: {
                max: 10,
                value: 10
            },
            armor: {
                max: 10,
                value: 10
            },
            damageable: {},
            globalState: {
                state: 'monster'
            },
            steeringBehaviour: {}
        }
    });
