angular.module('ces.component', ['ces.class'])
    .factory('Component', ['Class', function (Class) {
        'use strict';

        /**
         * The components is the container of some properties that
         * the entity possesses.
         * @class
         */
        var Component = Class.extend({
            /**
             * Name of this component. It is expected to be overriden and
             * should be unique.
             * @public
             * @readonly
             * @property {String} name
             */
            name: '',

            toJSON: function() {
                // for serialization, we assume _ prefixed variables are private and should not be serialized
                var json = {},
                    component = this,
                    keys = Object.keys(component);

                _.each(keys, function(key) {
                    if (key[0] !== '_') {
                        json[key] = component[key];
                    }
                });

                return json;
            }
        });

        return Component;

    }]);
