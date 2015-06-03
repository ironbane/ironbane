angular.module('ces.component', ['ces.class'])
    .factory('Component', ['Class', function (Class) {
        'use strict';

        /**
         * The components is the container of some properties that
         * the entity possesses.
         * @class
         */
        var Component = Class.extend({
            init: function(name, props) {
                var component = this;

                component.name = name;

                component.__properties = {};
                for (var field in props) {
                    component.trackProperty(field, props[field]);
                }
            },

            // tracks a property so that the component dirty flag can be tested (for serialization)
            trackProperty: function(prop, initialValue) {
                if (angular.isDefined(initialValue)) {
                    this.__properties[prop] = initialValue;
                }

                Object.defineProperty(this, prop, {
                    enumerable: true,
                    get: function() {
                        return this.__properties[prop];
                    },
                    set: function(val) {
                        this.__properties[prop] = val;
                        this.__dirty = true;
                    }
                });
            },

            /**
             * Name of this component. It is expected to be overriden and
             * should be unique.
             * @public
             * @readonly
             * @property {String} name
             */
            name: '',

            isDirty: function() {
                return !!this.__dirty;
            },

            setIsDirty: function(isDirty) {
                this.__dirty = !!isDirty;
            },

            toJSON: function() {
                // for serialization, we ONLY capture the state based on the tracked properties
                var json = {},
                    component = this;

                for(var key in component.__properties) {
                    json[key] = component[key];
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
