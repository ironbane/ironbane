angular.module('engine.debugger', [
        'underscore'
    ])
    .service('Debugger', ['_', function(_) {
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
    }]);
