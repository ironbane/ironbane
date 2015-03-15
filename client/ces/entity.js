angular.module('ces.entity', [
    'three',
    'ces.signal'
])
    .factory('Entity', function (THREE, Signal, $log) {
        'use strict';

        var Entity = function () {
            THREE.Object3D.call(this);

            this._components = {};
            this.onComponentAdded = new Signal();
            this.onComponentRemoved = new Signal();

            this.onChildAdded = new Signal();
            this.onChildRemoved = new Signal();
        };

        Entity.prototype = Object.create(THREE.Object3D.prototype);
        Entity.prototype.constructor = Entity;

        Entity.prototype.add = function (child) {
            var self = this;

            // three has some conditions in which this object might not be allowed to be added
            child.addEventListener('added', function () {
                //$log.debug('child entity added: ', child, child instanceof Entity);
                if (child instanceof Entity) {
                    self.onChildAdded.emit(self, child);
                }
            });

            // call the parent method, which does allow for multi-add
            THREE.Object3D.prototype.add.apply(this, arguments);
        };

        Entity.prototype.remove = function (child) {
            var self = this;

            child.addEventListener('removed', function () {
                if (child instanceof Entity) {
                    self.onChildRemoved.emit(self, child);
                }
            });

            THREE.Object3D.prototype.remove.apply(this, arguments);
        };

        /**
         * Check if this entity has a component by name.
         * @public
         * @param {String} componentName
         * @return {Boolean}
         */
        Entity.prototype.hasComponent = function (componentName) {
            return this._components['$' + componentName] !== undefined;
        };

        /**
         * Get a component of this entity by name.
         * @public
         * @param {String} componentName
         * @return {Component}
         */
        Entity.prototype.getComponent = function (componentName) {
            return this._components['$' + componentName];
        };

        /**
         * Add a component to this entity.
         * @public
         * @param {Component} component
         */
        Entity.prototype.addComponent = function (component) {
            this._components['$' + component.name] = component;
            this.onComponentAdded.emit(this, component.name);
        };

        /**
         * Remove a component from this entity by name.
         * @public
         * @param {String} componentName
         */
        Entity.prototype.removeComponent = function (componentName) {
            this._components['$' + componentName] = undefined;
            this.onComponentRemoved.emit(this, componentName);
        };


        /**
         * Shortcut method to get a script component
         * @public
         * @param {String} componentName
         * @return {Component}
         */
        Entity.prototype.getScript = function (scriptname) {
            var scriptComponent = this.getComponent('script');

            if (scriptComponent) {
                for (var i = 0; i < scriptComponent.scripts.length; i++) {
                    if (scriptComponent.scripts[i] === scriptname) {
                        return scriptComponent._scripts[i];
                    }
                }
            }
        };

        return Entity;
    });
