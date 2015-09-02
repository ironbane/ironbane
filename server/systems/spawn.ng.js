angular
    .module('server.systems.spawn', [
        'ces',
        'three',
        'engine.util',
        'engine.entity-builder'
    ])
    .factory('SpawnSystem', function(System, IbUtils, EntityBuilder, THREE) {
            'use strict';

            return System.extend({
                addedToWorld: function(world) {
                    var system = this;
                    system._super(world);

                    world.entityAdded('spawnZone').add(function (entity) {
                        var spawnZoneComponent = entity.getComponent('spawnZone');

                        spawnZoneComponent.spawnTimer = 0.0;
                        spawnZoneComponent.spawnList = [];

                    });

                    this.world = world;

                },
                update: function(dTime) {
                    var world = this.world;

                    var spawnZoneEntities = this.world.getEntities('spawnZone');
                    spawnZoneEntities.forEach(function(entity) {
                        var spawnZoneComponent = entity.getComponent('spawnZone');

                        if (spawnZoneComponent.spawnTimer <= dTime &&
                            spawnZoneComponent.spawnList.length < spawnZoneComponent.amountOfEntitiesToHaveAtAllTimes) {
                            spawnZoneComponent.spawnTimer = spawnZoneComponent.spawnDelay;

                            entity.children.forEach(function(child) {

                                var meshComponent = child.getComponent('mesh');
                                if (meshComponent && meshComponent._meshLoadTask) {
                                    meshComponent._meshLoadTask.then(function(mesh) {

                                        var randomPrefabName = _.sample(spawnZoneComponent.entitiesToSpawnSeparatedByCommas.split(','));

                                        var builtEntity = EntityBuilder.build({
                                            userData: {
                                                prefab: randomPrefabName
                                            },
                                            level: world.name
                                        });

                                        if (!mesh.geometry.boundingBox) {
                                            mesh.geometry.computeBoundingBox();
                                        }

                                        var randomPosition = new THREE.Vector3(
                                            IbUtils.getRandomFloat(mesh.geometry.boundingBox.min.x, mesh.geometry.boundingBox.max.x),
                                            IbUtils.getRandomFloat(mesh.geometry.boundingBox.min.y, mesh.geometry.boundingBox.max.y),
                                            IbUtils.getRandomFloat(mesh.geometry.boundingBox.min.z, mesh.geometry.boundingBox.max.z)
                                        );

                                        randomPosition.applyMatrix4(mesh.matrixWorld);

                                        builtEntity.position.copy(randomPosition);

                                        world.addEntity(builtEntity);

                                        spawnZoneComponent.spawnList.push(builtEntity);

                                        var listener = function (entity) {
                                            if (entity === builtEntity) {
                                                spawnZoneComponent.spawnList = _.without(spawnZoneComponent.spawnList, builtEntity);
                                                world.singleEntityRemoved.remove(listener);
                                            }
                                        };
                                        world.singleEntityRemoved.add(listener);

                                    })
                                    .then(null, function (err) {console.error(err.stack)});
                                }
                            });
                        }
                        else {
                            spawnZoneComponent.spawnTimer -= dTime;
                        }

                    });

                }
            });
        }
    );
