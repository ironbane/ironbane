angular
    .module('game.systems.particles', [
        'ces',
        'three',
        'underscore',
        'engine.shaderParticleEngine'
    ])
    .factory('ParticleSystem', [
        '_',
        'System',
        'THREE',
        'SPE',
        function(_, System, THREE, SPE) {
            'use strict';

            // massasge pure data into object
            function buildEmitterFromComponentData(data) {
                var options = _.extend({}, data),
                    vectorProps = [
                        'position',
                        'positionSpread',
                        'radiusScale',
                        'acceleration',
                        'accelerationSpread',
                        'velocity',
                        'velocitySpread',
                        'colorStartSpread',
                        'colorEndSpread',
                        'colorMiddleSpread'
                    ];

                _.each(vectorProps, function(prop) {
                    if (options[prop]) {
                        options[prop] = new THREE.Vector3().fromArray(options[prop]);
                    }
                });

                if (options.colorStart) {
                    options.colorStart = new THREE.Color(options.colorStart);
                }
                if (options.colorMiddle) {
                    options.colorMiddle = new THREE.Color(options.colorMiddle);
                }
                if (options.colorEnd) {
                    options.colorEnd = new THREE.Color(options.colorEnd);
                }

                return new SPE.Emitter(options);
            }

            var ParticleSystem = System.extend({
                addedToWorld: function(world) {
                    this._super(world);

                    // SPE's particle groups
                    this._groupData = [];
                    this._groups = [];

                    var system = this;

                    world.entityAdded('particleEmitter').add(function(entity) {
                        var emitterData = entity.getComponent('particleEmitter');
                        var particleGroup;
                        // determine if we have already created this group
                        var groupIndex = -1;
                        var existingGroup = _.find(system._groupData, function(group) {
                            var found = _.isMatch(group, emitterData.group);
                            groupIndex++;
                            return found;
                        });

                        if (existingGroup) {
                            particleGroup = system._groups[groupIndex];
                        } else {
                            system._groupData.push(emitterData.group); // copy instead?
                            var groupData = emitterData.group;
                            var texture = emitterData.group.texture instanceof THREE.Texture ?
                                emitterData.group.texture :
                                THREE.ImageUtils.loadTexture(emitterData.group.texture);
                            texture.magFilter = THREE.NearestFilter;
                            texture.minFilter = THREE.NearestFilter;
                            _.extend(groupData, {
                                texture: texture // ajax + cache?
                            });
                            particleGroup = new SPE.Group(groupData);
                            system._groups.push(particleGroup);
                            // since the group encompasses more than this entity, just add it to the world scene
                            system.world.scene.add(particleGroup.mesh);
                        }

                        // add the emitter to the group
                        var particleEmitter = buildEmitterFromComponentData(emitterData.emitter);
                        // sync position with entity (sadly can't add as a child)
                        particleEmitter.position = entity.position.clone();

                        // attach to component for later removal / manipulation
                        emitterData._emitter = particleEmitter;

                        particleGroup.addEmitter(particleEmitter);
                    });

                    // TODO: remove emitters
                },
                update: function(dt) {
                    // sync up emitter positions

                    // advance all the groups
                    _.each(this._groups, function(group) {
                        group.tick(dt);
                    });
                }
            });

            return ParticleSystem;
        }
    ]);
