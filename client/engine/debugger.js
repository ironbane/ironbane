angular
    .module('engine.debugger', [
        'underscore',
        'game.world-root'
    ])
    .service('Debugger', [
        '_',
        '$rootWorld',
        function(_, $rootWorld) {
            'use strict';

            this.watched = {};

            this.watch = function(label, variable) {
                this.watched[label] = variable;
            };

            this.$rootWorld = $rootWorld;
        }
    ]);
