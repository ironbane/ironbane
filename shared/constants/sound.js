angular
    .module('global.constants.sound', [])
    .constant('SOUND_CONFIG', {
        theme: {
            path: 'music/ib_theme',
            volume: 0.55,
            loop: true,
            type: 'music'
        },

        click: {
            path: 'sound/click',
            volume: 1,
            loop: false,
            type: 'sound'
        },


        // Battle
        arrowhit1: {
            path: "sound/battle/arrowhit1",
            volume: 0.6,
            loop: false,
            type: 'sound'
        },
        arrowhit2: {
            path: "sound/battle/arrowhit2",
            volume: 0.6,
            loop: false,
            type: 'sound'
        },
        arrowhit3: {
            path: "sound/battle/arrowhit3",
            volume: 0.6,
            loop: false,
            type: 'sound'
        },
        swing1: {
            path: "sound/battle/swing1",
            volume: 0.6,
            loop: false,
            type: 'sound'
        },
        swing2: {
            path: "sound/battle/swing2",
            volume: 0.6,
            loop: false,
            type: 'sound'
        },
        swing3: {
            path: "sound/battle/swing3",
            volume: 0.6,
            loop: false,
            type: 'sound'
        },
        hit1: {
            path: "sound/battle/hit1",
            volume: 0.6,
            loop: false,
            type: 'sound'
        },
        hit2: {
            path: "sound/battle/hit2",
            volume: 0.6,
            loop: false,
            type: 'sound'
        },
        hit3: {
            path: "sound/battle/hit3",
            volume: 0.6,
            loop: false,
            type: 'sound'
        },
        die1: {
            path: "sound/battle/die1",
            volume: 0.6,
            loop: false,
            type: 'sound'
        },
        die2: {
            path: "sound/battle/die2",
            volume: 0.6,
            loop: false,
            type: 'sound'
        },
        die3: {
            path: "sound/battle/die3",
            volume: 0.6,
            loop: false,
            type: 'sound'
        },
        firestaff: {
            path: "sound/battle/firestaff",
            volume: 0.6,
            loop: false,
            type: 'sound'
        },
        firearrow1: {
            path: "sound/battle/firearrow1",
            volume: 0.6,
            loop: false,
            type: 'sound'
        },
        firearrow2: {
            path: "sound/battle/firearrow2",
            volume: 0.6,
            loop: false,
            type: 'sound'
        },


        // Fighter
        jump: {
            path: "sound/fighter/jump",
            volume: 0.6,
            loop: false,
            type: 'sound'
        },




        __bogusSoundFile: {}
    })