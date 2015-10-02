angular.module('ces.entity', [
        'three',
        'ces.signal',
        'ces.components-registry'
    ])
    .factory('Entity', [
        'THREE',
        'Signal',
        '$components',
        '$log',
        function(THREE, Signal, $components, $log) {
            'use strict';

            function Entity() {
                THREE.Object3D.call(this);

                this._components = {};
                this.onComponentAdded = new Signal();
                this.onComponentRemoved = new Signal();

                this.onChildAdded = new Signal();
                this.onChildRemoved = new Signal();
            }

            Entity.prototype = Object.create(THREE.Object3D.prototype);
            Entity.prototype.constructor = Entity;

            Entity.prototype.add = function(child) {
                var self = this;

                // three has some conditions in which this object might not be allowed to be added
                child.addEventListener('added', function() {
                    //$log.debug('child entity added: ', child, child instanceof Entity);
                    if (child instanceof Entity) {
                        self.onChildAdded.emit(self, child);
                    }
                });

                // call the parent method, which does allow for multi-add
                THREE.Object3D.prototype.add.apply(this, arguments);
            };

            Entity.prototype.remove = function(child) {
                var self = this;

                child.addEventListener('removed', function() {
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
            Entity.prototype.hasComponent = function(componentName) {
                return this._components['$' + componentName] !== undefined;
            };

            /**
             * Get a component of this entity by name.
             * @public
             * @param {String} componentName
             * @return {Component}
             */
            Entity.prototype.getComponent = function(componentName) {
                return this._components['$' + componentName];
            };

            Entity.prototype.getComponents = function(dirtyOnly) {
                var components = {};
                _.each(this._components, function(component, componentName) {
                    var realName = componentName.substr(1);
                    if (dirtyOnly) {
                        if (component.isDirty()) {
                            components[realName] = component;
                        }
                    } else {
                        components[realName] = component;
                    }
                });

                return components;
            };

            Entity.prototype.getComponentNames = function() {
                return Object.keys(this._components)
                    .map(function(name) {
                        return name.substr(1);
                    });
            };

            /**
             * Add a component to this entity.
             * @public
             * @param {Component} component
             */
            Entity.prototype.addComponent = function(component, data) {
                // sugary
                if (angular.isString(component)) {
                    component = $components.get(component, data);
                }

                // don't add if already has
                if (this._components['$' + component.name]) {
                    return;
                }

                this._components['$' + component.name] = component;
                this.onComponentAdded.emit(this, component.name);
            };

            /**
             * Remove a component from this entity by name.
             * @public
             * @param {String} componentName
             */
            Entity.prototype.removeComponent = function(componentName) {
                this.onComponentRemoved.emit(this, componentName);
                delete this._components['$' + componentName];
            };


            /**
             * Shortcut method to get a script component
             * @public
             * @param {String} componentName
             * @return {Component}
             */
            Entity.prototype.getScript = function(scriptname) {
                var scriptComponent = this.getComponent('script');

                if (scriptComponent) {
                    for (var i = 0; i < scriptComponent.scripts.length; i++) {
                        if (scriptComponent.scripts[i] === scriptname) {
                            return scriptComponent._scripts[i];
                        }
                    }
                }
            };

            Entity.prototype.toJSON = function() {
                // we only want the info needed to rebuild this, not all of it
                var json = THREE.Object3D.prototype.toJSON.call(this);

                // now serialize the components
                function serializeComponents(data, entity) {
                    // because some children aren't entities...
                    if (entity instanceof Entity) {
                        data.components = {};
                        _.each(entity.getComponents(), function(component, componentName) {
                            if (component.__serialize !== false) {
                                data.components[componentName] = component.toJSON();
                            }
                        });
                    }

                    if (entity.children && entity.children.length > 0) {
                        _.each(entity.children, function(child, index) {
                            var childData = data.children[index];
                            serializeComponents(childData, child);
                        });
                    }
                }

                function serializeMetadata(data, entity) {
                    if (!data.metadata) {
                        data.metadata = {};
                    }

                    data.level = entity.level;
                }

                serializeComponents(json.object, this);
                serializeMetadata(json.object, this);

                // I don't like exposing this, however for the moment it's easiest
                json.object.owner = this.owner;

                //console.log('ent: ', this);

                // THREE has exporter metadata, but we don't really care...
                return json.object;
            };

            return Entity;
        }
    ]);
