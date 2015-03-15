angular.module('game.prefabs.bunny', [])
    .constant('BunnyPrefab', {
        components: {
            quad: {
                transparent: true,
                texture: 'assets/images/characters/skin/29.png'
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
            helper: {
                line: true
            },
            script: {
                scripts: [
                    '/scripts/built-in/sprite-sheet.js',
                ]
            },
            health: {
                max: 5,
                value: 5
            }
        }
    });
