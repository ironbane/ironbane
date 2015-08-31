angular
    .module('components.steeringBehaviour', ['ces'])
    .config([
        '$componentsProvider',
        function ($componentsProvider) {
            'use strict';

            $componentsProvider.register({
                'steeringBehaviour': {
                    speed: 2,
                    maxSpeed: 5,

                    // Wander
                    wanderRadius: 5.2,
                    wanderDistance: 2.0,
                    wanderJitter: 180.0
                }
            });
        }
    ]);
