angular
    .module('global.constants.game', [])
    .constant('IB_CONSTANTS', {
        serverAnnouncementsTimeout: 300,
        GAME_VERSION: '0.6.2 alpha',
        world: {
            mainMenuLevel: Meteor.settings.public.useDevZone ? 'dev-zone' : 'ravenwood',
            startLevel: Meteor.settings.public.useDevZone ? 'dev-zone' : 'ravenwood'
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
        deathWords: 'slaughtered butchered crushed defeated destroyed exterminated finished massacred mutilated slain vanquished killed'.split(' '),
        collisionMasks: {
            nothing: 0,
            level: 1,
            mainPlayer: 2,
            otherPlayers: 4,
            npcs: 8,
            playerProjectiles: 16,
            pickups: 32,
            raycasts: 64,
            enemyProjectiles: 128,
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
            'body': [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 16, 19, 23, 81, 82, 83, 94, 95, 97, 99, 102, 111, 200, 203, 204, 205, 206, 'oni_armor'],
            'feet': [0, 1, 2, 3, 4, 5, 6, 7, 9, 10, 11, 12, 13, 15, 20, 24, 84, 85, 100, 103, 104, 'oni_boots'],
            'head': [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 21, 22, 25, 86, 87, 89, 93, 95, 96, 98, 101, 105, 108, 112, 201, 202, 'oni_mask'],
            'hair': [0, 1, 2, 6, 1000, 1001, 1002, 1003, 1004, 1005, 1006, 1007, 1008, 1009, 1010, 1011, 1012, 1013, 1014, 1015, 1016, 1017, 1018, 1019],
            'eyes': [0, 1000, 1001, 1002, 1003, 1004, 1005, 1006, 1007, 1008, 1009, 1010, 1011, 1012, 1013, 1014, 1015, 1016, 1017, 1018, 1019],
            'skin': [0, 1, 2, 3, 10, 11, 23, 24, 25, 26, 27, 28, 29, 30, 32, 33, 34, 35, 36, 37, 40, 41, 42, 43, 44, 45, 46, 47, 109, 650, 651, 652, 653, 655, 656, 657, 658, 659, 660, 661, 662, 664, 665, 666, 667, 668, 669, 670, 671, 672, 673, 674, 675, 676, 677, 678, 695, 700, 701, 742, 772, 773, 1000, 1001, 1002, 1003, 1004, 1010, 1011, 1012, 1013, 1014, 1020, 1021, 1022, 1023, 1024, 1025, 1026, 1027, 1028, 1029, 1030, 1031, 1032, 1033, 1034, 1035, 1100, 'oni']
        },
        isDev: Meteor.isClient ? (window.location.hostname !== 'play.ironbane.com') : !process.env.IS_PROD
    })
    .run([
        'IB_CONSTANTS',
        function(IB_CONSTANTS) {
            'use strict';
            if (Meteor.isServer) {
                console.log('You are running in ' + (IB_CONSTANTS.isDev ? 'development' : 'production') + ' mode.');
                console.log('Server location: ' + Meteor.settings.server.name);
            }
        }
    ]);
