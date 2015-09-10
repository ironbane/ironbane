angular
    .module('server.services.game', [
        'models',
        'server.services.activeWorlds',
        'engine.entity-builder',
        'global.constants'
    ])
    .service('GameService', [
        'EntitiesCollection',
        '$activeWorlds',
        'IB_CONSTANTS',
        'EntityBuilder',
        function(EntitiesCollection, $activeWorlds, IB_CONSTANTS, EntityBuilder) {
            'use strict';

            this.enterGame = function(charId) {
                var me = this;

                var doc = EntitiesCollection.findOne({
                    owner: this.userId,
                    _id: charId
                });

                if (!doc) {
                    throw new Meteor.Error('char-not-found', 'Character not found!');
                }

                _.each($activeWorlds, function (world) {
                    var playerEntities = world.getEntities('player');
                    playerEntities.forEach(function (player) {
                        if (player.owner === me.userId) {
                            throw new Meteor.Error('already-in-game', 'You are already in-game!');
                        }
                    });
                });

                if ($activeWorlds[doc.level]) {
                    doc.components.player = {};
                    doc.components.netSend = {};
                    doc.components.netRecv = {};

                    var ent = EntityBuilder.build(doc);
                    if (ent) {
                        // it's unlikely that the server will not want to send an entity
                        ent.addComponent('persisted', {_id: doc._id});
                        ent.addComponent('steeringBehaviour', {
                            speed: 10,
                            maxSpeed: 10
                        });
                        ent.addComponent('fighter', {
                            faction: 'ravenwood'
                        });
                        ent.owner = doc.owner;

                        // Used to access metadata like cheats later on
                        ent.metadata = {
                            cheats: doc.cheats
                        };

                        // TODO: decorate entity with other components, such as "player", etc. like the client does
                        $activeWorlds[doc.level]._ownerCache[doc.owner] = ent.uuid;
                        $activeWorlds[doc.level].addEntity(ent);
                    } else {
                        $log.log('error building entity for: ', doc);
                    }
                    //$log.log('adding entity: ', doc.name, ' to ', doc.level, ' count: ', $activeWorlds[doc.level].getEntities().length);
                }
            };

            Meteor.users.find({
                'status.online': true
            }).observe({
                removed: function(user) {
                    _.each($activeWorlds, function (world) {
                        var playerEntities = world.getEntities('player');
                        playerEntities.forEach(function (player) {
                            if (player.owner === user._id) {
                                world.removeEntity(player);
                            }
                        });
                    });
                }
            });

            this.leaveGame = function() {
                var me = this;

                _.each($activeWorlds, function (world) {
                    var playerEntities = world.getEntities('player');
                    playerEntities.forEach(function (player) {
                        if (player.owner === me.userId) {
                            world.removeEntity(player);
                        }
                    });
                });
            };

            this.resetPlayer = function() {

                // Later, instead of ravenwood, we can point players to their real home
                // which they rent/bought using the virtul currency
                // TODO add timeout?

                var startLevel = IB_CONSTANTS.world.startLevel;


                var me = this;

                _.each($activeWorlds, function (world) {
                    var playerEntities = world.getEntities('player');
                    playerEntities.forEach(function (player) {
                        if (player.owner === me.userId && !player.__isResetting) {

                            player.__isResetting = true;

                            world.removeEntity(player);

                            setTimeout(function () {
                                if ($activeWorlds[startLevel]) {
                                    // if not we have a problem!
                                    var spawns = $activeWorlds[startLevel].getEntities('spawnPoint');
                                    if (spawns.length === 0) {
                                        $log.log(startLevel, ' has no spawn points defined!');
                                    }
                                    // Just pick one of them
                                    // Having multiple spawns is useful against AFK players so
                                    // we don't have players spawning in/on top of eachother too much.
                                    (function(spawn) {
                                        var component = spawn.getComponent('spawnPoint');

                                        if (component.tag === 'playerStart') {
                                            player.position.copy(spawn.position);
                                            player.rotation.copy(spawn.rotation);
                                        }
                                    })(_.sample(spawns));
                                }

                                $activeWorlds[startLevel].addEntity(player);

                                delete player.__isResetting;
                            }, 2000);

                        }
                    });
                });

                return true;
            };
        }
    ])
    .run(['GameService', function(GameService) {
        'use strict';

        Meteor.methods({
            enterGame: GameService.enterGame,
            leaveGame: GameService.leaveGame,
            resetPlayer: GameService.resetPlayer
        });
    }]);
