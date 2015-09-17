angular
    .module('ces.system', [
        'ces.class'
    ])
    .factory('System', [
        'Class',
        function(Class) {
            'use strict';
            /**
             * The system is responsible for updating the entities.
             * @class
             */
            var System = Class.extend({
                /**
                 * @constructor
                 */
                init: function() {
                    /**
                     * This property will be set when the system is added to a world.
                     * @public
                     */
                    this.world = null;
                },

                addedToWorld: function(world) {
                    this.world = world;
                },

                removedFromWorld: function(world) {
                    this.world = null;
                },

                // should override and use in update loop
                isActive: function() {
                    return true;
                },

                /**
                 * Update the entities.
                 * @public
                 * @param {Number} dt time interval between updates
                 */
                update: function(dt) {
                    throw new Error('Subclassed should override this method');
                }
            });

            return System;

        }
    ]);
