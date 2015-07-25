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
                }
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
                max: 5,
                value: 5
            },
            globalState: {
                state: 'monster'
            },
            steeringBehaviour: {}
        }
    });
