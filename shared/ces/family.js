angular
    .module('ces.family', [
        'ces.class',
        'ces.entitylist',
        'ces.signal'
    ])
    .factory('Family', [
        'Class',
        'EntityList',
        'Signal',
        function(Class, EntityList, Signal) {
            'use strict';
            /**
             * The family is a collection of entities having all the specified components.
             * @class
             */
            var Family = Class.extend({
                /**
                 * @constructor
                 * @param {Array} componentNames
                 */
                init: function(componentNames) {
                    /**
                     * @private
                     */
                    this._componentNames = componentNames;

                    // split into 3 types of criteria
                    this._allOfComponents = componentNames.filter(function(name) {
                        return (name.substr(0, 1) !== '!' && name.substr(0, 1) !== '?');
                    });
                    this._noneOfComponents = componentNames.filter(function(name) {
                        return (name.substr(0, 1) === '!');
                    }).map(function(name) {
                        return name.substr(1);
                    });
                    this._anyOfComponents = componentNames.filter(function(name) {
                        return (name.substr(0, 1) === '?');
                    }).map(function(name) {
                        return name.substr(1);
                    });

                    /**
                     * A linked list holding the entities;
                     * @private
                     */
                    this._entities = new EntityList();

                    /**
                     * @public
                     * @readonly
                     */
                    this.entityAdded = new Signal();

                    /**
                     * @public
                     * @readonly
                     */
                    this.entityRemoved = new Signal();
                },

                /**
                 * Get the entities of this family.
                 * @public
                 * @return {Array}
                 */
                getEntities: function() {
                    return this._entities.toArray();
                },

                forEach: function(callback, reversed) {
                    this._entities.forEach(callback, reversed);
                },

                /**
                 * Add the entity into the family if match.
                 * @public
                 * @param {Entity} entity
                 */
                addEntityIfMatch: function(entity) {
                    return this._checkEntity(entity);
                },

                addEntity: function(entity) {
                    if (!this._entities.has(entity)) {
                        this._entities.add(entity);
                        this.entityAdded.emit(entity);
                    }
                },

                /**
                 * Remove the entity into the family if match.
                 * @public
                 * @function
                 * @param {Entity} entity
                 */
                removeEntity: function(entity) {
                    if (this._entities.has(entity)) {
                        this._entities.remove(entity);
                        this.entityRemoved.emit(entity);
                    }
                },

                /**
                 * Handler to be called when a component is added to an entity.
                 * @public
                 * @param {Entity} entity
                 */
                onComponentAdded: function(entity) {
                    this._checkEntity(entity);
                },

                /**
                 * Handler to be called when a component is removed from an entity.
                 * @public
                 * @param {Entity} entity
                 */
                onComponentRemoved: function(entity, componentName) {
                    var components = entity.getComponentNames()
                        .filter(function(name) {
                            return name !== componentName;
                        });

                    this._checkEntity(entity, components);
                },

                /**
                 * Check if an entity belongs to this family.
                 * @private
                 * @param {Entity} entity
                 * @return {Boolean}
                 */
                _checkEntity: function(entity, components) {
                    var contains = this._entities.has(entity),
                        interested = true;

                    components = components || entity.getComponentNames();

                    if (this._allOfComponents.length > 0) {
                        interested = this._allOfComponents.every(function(component) {
                            return components.indexOf(component) >= 0;
                        });
                    }

                    if (this._noneOfComponents.length > 0 && interested) {
                        interested = this._noneOfComponents.every(function(component) {
                            return components.indexOf(component) < 0;
                        });
                    }

                    if (this._anyOfComponents.length > 0 && interested) {
                        interested = this._anyOfComponents.some(function(component) {
                            return components.indexOf(component) >= 0;
                        });
                    }

                    if (contains && !interested) {
                        this.removeEntity(entity);
                    } else if (!contains && interested) {
                        this.addEntity(entity);
                    }

                    return interested;
                }
            });

            return Family;

        }
    ]);
