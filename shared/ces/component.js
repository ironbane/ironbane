angular
    .module('ces.component', [])
    .factory('Component', [
        function() {
            'use strict';

            function Component(name, props) {
                this.name = name;

                this.__properties = {};
                for (var field in props) {
                    // don't track any designated private variables
                    if (field.substr(2) === '__') {
                        this[field] = props[field];
                    } else {
                        this.trackProperty(field, props[field]);
                    }
                }
            }

            Component.prototype.trackProperty = function(prop, initialValue) {
                if (angular.isDefined(initialValue)) {
                    this.__properties[prop] = initialValue;
                }

                Object.defineProperty(this, prop, {
                    enumerable: true,
                    configurable: true,
                    get: function() {
                        return this.__properties[prop];
                    },
                    set: function(val) {
                        this.__properties[prop] = val;
                        this.__dirty = true;
                    }
                });
            };

            Component.prototype.isDirty = function() {
                return !!this.__dirty;
            };

            Component.prototype.setIsDirty = function(isDirty) {
                this.__dirty = !!isDirty;
            };

            Component.prototype.toJSON = function() {
                // for serialization, we ONLY capture the state based on the tracked properties
                var json = {},
                    component = this;

                json.name = component.name;

                for (var key in component.__properties) {
                    json[key] = component[key];
                }

                return json;
            };

            Component.prototype.fromJSON = function(json) {
                // deep?
                _.extend(this, json);
            };

            Component.prototype.serializeNet = function() {
                return this.toJSON();
            };

            Component.prototype.deserializeNet = function(data) {
                this.fromJSON(data);
            };

            return Component;

        }
    ]);
