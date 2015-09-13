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
        deathWords: 'slaughtered butchered crushed defeated destroyed exterminated finished massacred mutilated slayed vanquished killed'.split(' '),
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
        charImages: {
            'body': [0, 1,10,102,11,12,16,19,2,200,203,204,205,206,23,3,4,5,6,7,8,81,82,83,9,94,95,97,99,111],
            'feet': [0, 1,10,100,103,104,11,12,13,15,2,20,24,3,4,5,6,7,84,85,9],
            'head': [0, 1,10,11,12,13,14,15,16,17,18,2,201,202,21,22,25,3,4,5,6,7,8,86,87,89,9,93,95,96,98,101,105,108,112,201,202],
            'hair': [0, 1,1000,1001,1002,1003,1004,1005,1006,1007,1008,1009,1010,1011,1012,1013,1014,1015,1016,1017,1018,1019,2,6],
            'eyes': [0, 1000,1001,1002,1003,1004,1005,1006,1007,1008,1009,1010,1011,1012,1013,1014,1015,1016,1017,1018,1019],
            'skin': [0, 1,10,1000,1001,1002,1003,1004,1010,1011,1012,1013,1014,1020,1021,1022,1023,1024,1025,1026,1027,1028,1029,1030,1031,1032,1033,1034,1035,11,1100,2,23,24,25,26,27,28,29,3,30,32,33,34,35,36,37,40,41,42,43,44,45,46,47,109,650,651,652,653,655,656,657,658,659,660,661,662,664,665,666,667,668,669,670,671,672,673,674,675,676,677,678,695,700,701,772,773]
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
