angular
    .module('global.constants', [])
    .constant('IB_CONSTANTS', {
        serverAnnouncementsTimeout: 300,
        GAME_VERSION: '0.4.0 pre-alpha',
        world: {
            mainMenuLevel: 'ben-dev-zone',
            startLevel: 'ben-dev-zone',
            startPosition: [-15, 2, 12],
            startRotation: [0, Math.PI - 0.3, 0]
        },
        characterParts: {
            male: {
                skin: [1000, 1001, 1002, 1003, 1004],
                hair: [1000, 1001, 1002, 1003, 1004, 1005, 1006, 1007, 1008, 1009],
                eyes: [1000, 1001, 1002, 1003, 1004, 1005, 1006, 1007, 1008, 1009]
            },
            female: {
                skin: [1010, 1011, 1012, 1013, 1014],
                hair: [1010, 1011, 1012, 1013, 1014, 1015, 1016, 1017, 1018, 1019],
                eyes: [1010, 1011, 1012, 1013, 1014, 1015, 1016, 1017, 1018, 1019]
            }
        },
        rules: {
            maxCharactersAllowed: 3,
            minCharNameLength: 2,
            maxCharNameLength: 15
        },
        isDev: Meteor.isClient ? (window.location.hostname === 'localhost' || window.location.hostname === 'dev.ironbane.com') : (process.env.ROOT_URL.indexOf('localhost') !== -1)
    })
    .run([
        'IB_CONSTANTS',
        '$log',
        function(IB_CONSTANTS, $log) {
            'use strict';
            $log.debug('You are running in ' + (IB_CONSTANTS.isDev ? 'development' : 'production') + ' mode.');
        }
    ]);
