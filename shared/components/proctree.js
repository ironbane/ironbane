angular
    .module('components.proctree', ['ces'])
    .config([
        '$componentsProvider',
        function($componentsProvider) {
            'use strict';

            $componentsProvider.register({
                'proctree': {
                    'seed': 61,
                    'segments': 6,
                    'levels': 1,
                    'vMultiplier': 0.66,
                    'twigScale': 1,
                    'initalBranchLength': 0.5,
                    'lengthFalloffFactor': 0.85,
                    'lengthFalloffPower': 0.99,
                    'clumpMax': 0.449,
                    'clumpMin': 0.404,
                    'branchFactor': 3.75,
                    'dropAmount': 0.07,
                    'growAmount': -0.005,
                    'sweepAmount': 0.01,
                    'maxRadius': 0.269,
                    'climbRate': 0.626,
                    'trunkKink': 0.108,
                    'treeSteps': 4,
                    'taperRate': 0.876,
                    'radiusFalloffRate': 0.66,
                    'twistRate': 2.7,
                    'trunkLength': 1.55,
                    'trunkMaterial': 'bark1.png',
                    'twigMaterial': 'leaves1.png'
                }
            });
        }
    ]);
