angular.module('engine.ib-config', [])
    .provider('IbConfig', function () {
        'use strict';

        var config = {};

        this.set = function (key, value) {
            config[key] = value;
        };

        this.$get = function () {
            return {
                get: function (key, defaultValue) {
                    if (config[key]) {
                        return config[key];
                    }

                    if (defaultValue) {
                        return defaultValue;
                    }
                }
            };
        };
    });
