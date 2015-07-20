angular
    .module('game.services.globalsound', [
        'game.systems.sound',
    ])
    .factory('GlobalSound', ['SoundSystem',
        function(SoundSystem) {
            'use strict';

            var soundSystem = new SoundSystem();

            return soundSystem;
        }
    ]);
