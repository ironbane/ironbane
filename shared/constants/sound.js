angular
    .module('global.constants.sound', [])
    .constant('SOUND_CONFIG', {
        theme: {
            path: 'music/caketown_1',
            volume: 0.55,
            loop: false,
            type: 'music'
        },

        atmos_day: {
            path: 'music/atmos_day',
            volume: 0.55,
            loop: false,
            type: 'music'
        },

        click: {
            path: 'sound/click',
            volume: 1,
            loop: false,
            type: 'sound'
        },


        swing1: {
            path: 'sound/battle/swing1',
            volume: 1.0,
            loop: false,
            type: 'sound'
        },

        hit1: {
            path: 'sound/battle/hit1',
            volume: 0.6,
            loop: false,
            type: 'sound'
        },
        hit2: {
            path: 'sound/battle/hit2',
            volume: 0.6,
            loop: false,
            type: 'sound'
        },
        hit3: {
            path: 'sound/battle/hit3',
            volume: 0.6,
            loop: false,
            type: 'sound'
        },
        die1: {
            path: 'sound/battle/die1',
            volume: 0.6,
            loop: false,
            type: 'sound'
        },
        die2: {
            path: 'sound/battle/die2',
            volume: 0.6,
            loop: false,
            type: 'sound'
        },
        die3: {
            path: 'sound/battle/die3',
            volume: 0.6,
            loop: false,
            type: 'sound'
        },


        // Fighter
        jump: {
            path: 'sound/fighter/jump',
            volume: 0.6,
            loop: false,
            type: 'sound'
        },

        // Inventory
        bag1: {
            path: 'sound/inv/bag1',
            volume: 1.0,
            loop: false,
            type: 'sound'
        },

        // Inventory
        pickup: {
            path: "sound/inv/pickup",
            volume: 1.0,
            loop: false,
            type: 'sound'
        },

        coins: {
            path: 'sound/inv/coin',
            volume: 1.0,
            loop: false,
            type: 'sound'
        },

        drop: {
            path: 'sound/inv/drop',
            volume: 0.4,
            loop: false,
            type: 'sound'
        },

        use: {
            path: 'sound/inv/use',
            volume: 0.6,
            loop: false,
            type: 'sound'
        },

        teleport: {
            path: 'sound/effects/teleport',
            volume: 0.5,
            loop: false,
            type: 'sound'
        },

        __bogusSoundFile: {}
    });
