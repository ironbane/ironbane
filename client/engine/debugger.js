angular
    .module('engine.debugger', [
        'ces',
        'underscore',
        'game.world-root',
        'engine.entity-builder'
    ])
    .service('Debugger', [
        '_',
        '$rootWorld',
        'EntityBuilder',
        '$components',
        function(_, $rootWorld, EntityBuilder, $components) {
            'use strict';

            this.watched = {};

            this.watch = function(label, variable) {
                this.watched[label] = variable;
            };

            this.$rootWorld = $rootWorld;
            this.$components = $components;
            this.EntityBuilder = EntityBuilder;
        }
    ]);
