angular
    .module('engine.debugger', [
        'underscore',
        'game.world-root',
        'engine.entity-builder'
    ])
    .service('Debugger', [
        '_',
        '$rootWorld',
        'EntityBuilder',
        function(_, $rootWorld, EntityBuilder) {
            'use strict';

            this.watched = {};

            this.watch = function(label, variable) {
                this.watched[label] = variable;
            };

            this.$rootWorld = $rootWorld;

            this.EntityBuilder = EntityBuilder;
        }
    ]);
