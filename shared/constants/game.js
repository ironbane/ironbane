angular
    .module('global.constants.game', [])
    .constant('IB_CONSTANTS', {
        serverAnnouncementsTimeout: 300,
        GAME_VERSION: '0.5 alpha',
        world: {
            mainMenuLevel: 'ravenwood',
            startLevel: 'ravenwood',
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
        collisionMasks: {
            nothing: 0,
            level: 1,
            mainPlayer: 2,
            otherPlayers: 4,
            npcs: 8,
            projectiles: 16,
            all: 65535
        },
        rules: {
            minCharNameLength: 2,
            maxCharNameLength: 15
        },
        ironbloodRates: {
            extraCharacterSlot: 5
        },
        ironbloodPacks: {
            'tiny': {
                name: 'Tiny Pack',
                ironblood: 5,
                dollars: 5 * 0.5
            },
            'small': {
                name: 'Small Pack',
                ironblood: 12,
                dollars: 10 * 0.5,
                desc: 'Most popular!'
            },
            'medium': {
                name: 'Medium Pack',
                ironblood: 26,
                dollars: 20 * 0.5
            },
            'large': {
                name: 'Large Pack',
                ironblood: 70,
                dollars: 50 * 0.5
            },
            'huge': {
                name: 'Huge Pack',
                ironblood: 160,
                dollars: 100 * 0.5,
                desc: 'Best value!'
            },
        },
        isDev: Meteor.isClient ? (window.location.hostname !== 'play.ironbane.com') : (process.env.VIRTUAL_HOST !== 'play.ironbane.com')
    })
    .run([
        'IB_CONSTANTS',
        '$log',
        function(IB_CONSTANTS, $log) {
            'use strict';
            $log.debug('You are running in ' + (IB_CONSTANTS.isDev ? 'development' : 'production') + ' mode.');
        }
    ]);
