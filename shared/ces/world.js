angular
    .module('ces.world', [
        'ces.class',
        'ces.family',
        'ces.entity',
        'ces.entitylist',
        'ces.signal',
        'ces.pubsub'
    ])
    .factory('World', [
        'Class',
        'Family',
        'Entity',
        'EntityList',
        'CESPubSub',
        'Signal',
        '$log',
        function(Class, Family, Entity, EntityList, CESPubSub, Signal, $log) {
            'use strict';

            /**
             * The world is the container of all the entities and systems.
             * @class
             */
            var World = Class.extend({
                /**
                 * @constructor
                 */
                init: function() {
                    /**
                     * A map from familyId to family
                     * @private
                     */
                    this._families = {};

                    /**
                     * @private
                     */
                    this._systems = [];
                    this._systemRegistry = {};

                    /**
                     * @private
                     */
                    this._entities = new EntityList();

                    // each world has a message bus
                    this._pubsub = new CESPubSub({debug: false});

                    // queue up all remove calls until after the system update loop
                    this._pendingRemovals = [];

                    this.singleEntityRemoved = new Signal();
                },

                publish: function(/* args */) {
                    var args = Array.prototype.slice.call(arguments, 0);
                    this._pubsub.publish.apply(this._pubsub, args);
                },

                subscribe: function(eventName, callback) {
                    this._pubsub.subscribe(eventName, callback);
                },

                /**
                 * Add a system to this world.
                 * @public
                 * @param {System} system
                 */
                addSystem: function(system, name) {
                    this._systems.push(system);
                    if (name) {
                        this._systemRegistry[name] = system;
                    } else {
                        this._systemRegistry[Date.now()] = system;
                    }
                    system.addedToWorld(this);
                    return this;
                },

                /**
                 * Remove a system from this world.
                 * @public
                 * @param {System} system
                 */
                removeSystem: function(system, name) {
                    var systems, i, len;

                    if (name) {
                        delete this._systemRegistry[name];
                    }

                    systems = this._systems;
                    for (i = 0, len = systems.length; i < len; ++i) {
                        if (systems[i] === system) {
                            systems.splice(i, 1);
                            system.removedFromWorld();
                        }
                    }
                },

                getSystem: function(name) {
                    return this._systemRegistry[name];
                },

                /**
                 * Add an entity to this world.
                 * @public
                 * @param {Entity} entity
                 */
                addEntity: function(entity) {
                    var families, familyId, self;

                    // try to add the entity into each family
                    families = this._families;
                    for (familyId in families) {
                        families[familyId].addEntityIfMatch(entity);
                    }

                    self = this;

                    // update the entity-family relationship whenever components are
                    // added to or removed from the entities
                    entity.onComponentAdded.add(function(entity, component) {
                        self._onComponentAdded(entity, component);
                    });
                    entity.onComponentRemoved.add(function(entity, component) {
                        self._onComponentRemoved(entity, component);
                    });

                    entity.onChildAdded.add(function(entity, child) {
                        self._onEntityAddChild(entity, child);
                    });
                    entity.onChildRemoved.add(function(entity, child) {
                        self._onEntityRemoveChild(entity, child);
                    });

                    this._entities.add(entity);

                    this._onEntityAddChild(null, entity);
                },

                /**
                 * Remove and entity from this world.
                 * @public
                 * @param {Entity} entity
                 */
                removeEntity: function(entity) {
                    // if we're in the middle of doing the system loop, wait until we're done
                    if (this.__systemUpdate) {
                        this._pendingRemovals.push(entity);
                        return;
                    }

                    var families, familyId;

                    // try to remove the entity from each family
                    families = this._families;
                    for (familyId in families) {
                        families[familyId].removeEntity(entity);
                    }

                    this._entities.remove(entity);

                    this._onEntityRemoveChild(null, entity);

                    this.singleEntityRemoved.emit(entity);

                    entity.onComponentAdded.removeListeners();
                    entity.onComponentRemoved.removeListeners();
                    entity.onChildAdded.removeListeners();
                    entity.onChildRemoved.removeListeners();
                },

                _purgePendingRemovals: function() {
                    if (this.__systemUpdate) {
                        $log.warn('do not call purge during the update loop!');
                    }

                    var entity;
                    while((entity = this._pendingRemovals.pop())) {
                        this.removeEntity(entity);
                    }
                },

                /**
                 * Get the entities having all the specified componets.
                 * @public
                 * @param {...String} componentNames
                 * @return {Array} an array of entities.
                 */
                getEntities: function( /* componentNames */ ) {
                    var familyId;

                    familyId = this._getFamilyId(arguments);
                    this._ensureFamilyExists(arguments);

                    return this._families[familyId].getEntities();
                },

                getFamily: function( /* componentNames */ ) {
                    var familyId;

                    familyId = this._getFamilyId(arguments);
                    this._ensureFamilyExists(arguments);

                    return this._families[familyId];
                },

                forEachEntity: function( /* componentNames */ ) {
                    var family,
                        args = Array.prototype.slice.call(arguments),
                        callback = args.pop();

                    if (typeof(callback) !== 'function') {
                        return false;
                    }

                    family = this.getFamily.apply(this, args);
                    family.forEach(callback);
                },

                getEntityById: function(id, components) {
                    return _.findWhere(this.getEntities(components), {uuid: id});
                },

                /**
                 * For each system in the world, call its `update` method.
                 * @public
                 * @param {Number} dt time interval between updates.
                 */
                update: function(dt, elapsed, timestamp) {
                    var systems, i, len;

                    this.__systemUpdate = true;

                    systems = this._systems;
                    for (i = 0, len = systems.length; i < len; ++i) {
                        systems[i].update(dt, elapsed, timestamp);
                    }

                    this.__systemUpdate = false;

                    this._purgePendingRemovals();
                },

                /**
                 * Returns the signal for entities added with the specified components. The
                 * signal is also emitted when a component is added to an entity causing it
                 * match the specified component names.
                 * @public
                 * @param {...String} componentNames
                 * @return {Signal} A signal which is emitted every time an entity with
                 *     specified components is added.
                 */
                entityAdded: function( /* componentNames */ ) {
                    var familyId;

                    familyId = this._getFamilyId(arguments);
                    this._ensureFamilyExists(arguments);

                    return this._families[familyId].entityAdded;
                },

                /**
                 * Returns the signal for entities removed with the specified components.
                 * The signal is also emitted when a component is removed from an entity
                 * causing it to no longer match the specified component names.
                 * @public
                 * @param {...String} componentNames
                 * @return {Signal} A signal which is emitted every time an entity with
                 *     specified components is removed.
                 */
                entityRemoved: function( /* componentNames */ ) {
                    var familyId;

                    familyId = this._getFamilyId(arguments);
                    this._ensureFamilyExists(arguments);

                    return this._families[familyId].entityRemoved;
                },

                /**
                 * Creates a family for the passed array of component names if it does not
                 * exist already.
                 * @param {Array.<String>} components
                 */
                _ensureFamilyExists: function(components) {
                    var families = this._families,
                        familyId = this._getFamilyId(components),
                        family = families[familyId];

                    if (!family) {
                        family = families[familyId] = new Family(Array.prototype.slice.call(components));
                        this._entities.forEach(function(entity) {
                            family.addEntityIfMatch(entity);
                        });
                    }
                },

                /**
                 * Returns the family ID for the passed array of component names. A family
                 * ID is a comma separated string of all component names with a '$'
                 * prepended.
                 * @param {Array.<String>} components
                 * @return {String} The family ID for the passed array of components.
                 */
                _getFamilyId: function(components) {
                    return '$' + Array.prototype.join.call(components, ',');
                },

                /**
                 * Handler to be called when a component is added to an entity.
                 * @private
                 * @param {Entity} entity
                 * @param {String} componentName
                 */
                _onComponentAdded: function(entity, componentName) {
                    var families, familyId;

                    families = this._families;
                    for (familyId in families) {
                        families[familyId].onComponentAdded(entity, componentName);
                    }
                },

                /**
                 * Handler to be called when component is removed from an entity.
                 * @private
                 * @param {Entity} entity
                 * @param {String} componentName
                 */
                _onComponentRemoved: function(entity, componentName) {
                    var families, familyId;

                    families = this._families;
                    for (familyId in families) {
                        families[familyId].onComponentRemoved(entity, componentName);
                    }
                },

                _onEntityAddChild: function(entity, child) {
                    var world = this;

                    //$log.debug('_onEntityAddChild: ', entity, child);

                    // check if children are entities and add them
                    if (child.children && child.children.length > 0) {
                        //$log.debug(child.name, ' has ', child.children.length, ' children.');
                        angular.forEach(child.children, function(c) {
                            if (c instanceof Entity) {
                                //$log.debug('add child', c.name);
                                // the add entity workflow will end up handling the recursion here
                                world.addEntity(c);
                            }
                        });
                    }
                },

                _onEntityRemoveChild: function(entity, child) {
                    var world = this;

                    if (child.children && child.children.length > 0) {
                        angular.forEach(child.children, function(c) {
                            if (c instanceof Entity) {
                                world.removeEntity(c);
                            }
                        });
                    }
                }
            });

            return World;
        }
    ]);
