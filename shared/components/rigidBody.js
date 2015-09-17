angular
    .module('components.rigidBody', ['ces'])
    .config([
        '$componentsProvider',
        function($componentsProvider) {
            'use strict';

            $componentsProvider.register({
                'rigidBody': {
                    mass: 1,
                    shape: {
                        type: 'sphere',
                        radius: 1
                    },
                    allowSleep: true,
                    lock: {
                        position: {
                            x: false,
                            y: false,
                            z: false
                        },
                        rotation: {
                            x: false,
                            y: false,
                            z: false
                        }
                    },
                    launchVelocity: {
                        x: 0,
                        y: 0,
                        z: 0
                    },
                    offset: {
                        x: 0,
                        y: 0,
                        z: 0
                    },
                    restitution: 0.003,
                    friction: 0.5,
                    group: null,
                    collidesWith: []
                }
            });
        }
    ]);
