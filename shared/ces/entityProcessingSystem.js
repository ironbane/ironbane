angular
    .module('ces.entityProcessingSystem', [
        'ces.system'
    ])
    .factory('EntityProcessingSystem', [
        'System',
        function(System) {
            'use strict';

            var EntityProcessingSystem = System.extend({
                init: function( /* componentNames */ ) {
                    this._super();

                    this._familyConfig = Array.prototype.slice.call(arguments);
                },
                addedToWorld: function(world) {
                    this._super(world);

                    world.entityAdded.apply(world, this._familyConfig)
                        .add(this.onEntityAdded.bind(this));

                    world.entityRemoved.apply(world, this._familyConfig)
                        .add(this.onEntityRemoved.bind(this));
                },
                onEntityAdded: function(entity) {
                    // subclass should use
                },
                onEntityRemoved: function(entity) {
                    // optional subclass
                },
                update: function(dt, elapsed, timestamp) {
                    if (!this.isActive()) {
                        return;
                    }

                    var system = this,
                        world = this.world,
                        callback = function(entity) {
                            var timing = {dt: dt, elapsed: elapsed, timestamp: timestamp};
                            system.updateEntity(timing, entity);
                        },
                        args = this._familyConfig.concat([callback]);

                    world.forEachEntity.apply(world, args);
                },
                updateEntity: function(timing, entity) {
                    // should be subclassed
                }
            });

            return EntityProcessingSystem;
        }
    ]);
