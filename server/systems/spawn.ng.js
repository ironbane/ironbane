angular
    .module('server.systems.spawn', [
        'ces',
        'three',
        'engine.util',
        'engine.entity-builder',
        'server.services.activeWorlds'
    ])
    .factory('SpawnSystem', function(System, IbUtils, EntityBuilder, THREE, $activeWorlds) {
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

                                        builtEntity.name = randomPrefabName;

                                        world.addEntity(builtEntity);

                                        spawnZoneComponent.spawnList.push(builtEntity);

                                        var listener = function (entity) {
                                            if (entity === builtEntity) {
                                                spawnZoneComponent.spawnList = _.without(spawnZoneComponent.spawnList, builtEntity);
                                                setTimeout(function () {
                                                    world.singleEntityRemoved.remove(listener);
                                                }, 0);
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


                    // Check if we're able to respawn players
                    var healthEntities = world.getEntities('health');
                    healthEntities.forEach(function(entity) {
                        var healthComponent = entity.getComponent('health');
                        if (healthComponent) {
                            if (healthComponent.value <= 0 && !healthComponent.__hasDied) {

                                healthComponent.__hasDied = true;

                                if (entity.hasComponent('player')) {
                                    // entity.removeComponent('quad');
                                    // entity.removeComponent('wieldItem');
                                    // entity.removeComponent('fighter');
                                    // entity.removeComponent('shadow');


                                    Meteor.setTimeout(function () {

                                        // Make sure the player is still online!
                                        var user = Meteor.users.findOne(entity.owner);
                                        if (user.status.online) {

                                            delete healthComponent.__hasDied;
                                            healthComponent.value = healthComponent.max;

                                            if ($activeWorlds[entity.level]) {
                                                // if not we have a problem!
                                                var spawns = $activeWorlds[entity.level].getEntities('spawnPoint');
                                                if (spawns.length === 0) {
                                                    $log.log(entity.level, ' has no spawn points defined!');
                                                }
                                                // Just pick one of them
                                                // Having multiple spawns is useful against AFK players so
                                                // we don't have players spawning in/on top of eachother too much.
                                                (function(spawn) {
                                                    var component = spawn.getComponent('spawnPoint');

                                                    if (component.tag === 'playerStart') {
                                                        entity.position.copy(spawn.position);
                                                        entity.rotation.copy(spawn.rotation);
                                                    }
                                                })(_.sample(spawns));
                                            }

                                            world.addEntity(entity);

                                        }
                                    }, 5000);
                                }

                                setTimeout(function () {
                                    world.removeEntity(entity);
                                }, 1000);

                            }
                        }
                    });

                }
            });
        }
    );
