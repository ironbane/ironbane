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
                    component = this;

                // components by nature are extended from prototype, so we want all keys
                for(var key in component) {
                    if (key[0] !== '_') {
                        json[key] = component[key];
                    }
                }

                return json;
            },

            fromJSON: function(json) {
                // deep?
                _.extend(this, json);
            },

            serializeNet: function() {
                // this is the default, individual components can define their own net behavior
                return this.toJSON();
            },

            deserializeNet: function(data) {
                this.fromJSON(data);
            }
        });

        return Component;

    }]);
