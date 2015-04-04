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

            this.watched = [];

            this.watch = function(label, variable) {
                var found = _.find(this.watched, function(item) {
                    return item.label === label;
                });

                if (!found) {
                    this.watched.push({
                        label: label,
                        variable: variable
                    });
                }
            };

            this.$rootWorld = $rootWorld;
        }
    ]);
