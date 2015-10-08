angular
    .module('server.services.game', [
        'models',
        'server.services.activeWorlds',
        'engine.entity-builder',
        'global.constants',
        'server.services.chat',
        'three'
    ])
    .service('GameService', [
        'EntitiesCollection',
        '$activeWorlds',
        'IB_CONSTANTS',
        'EntityBuilder',
        'ChatService',
        'THREE',
        function(EntitiesCollection, $activeWorlds, IB_CONSTANTS, EntityBuilder, ChatService, THREE) {
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

                var user = Meteor.users.findOne(this.userId);
                if (user.profile.server.id !== Meteor.settings.server.id) {
                    throw new Meteor.Error('server-mismatch', 'You are already in-game on another server!');
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

                    // Make sure regen stays the same across updates
                    doc.components.armorRegen = {
                        rate: 2.0,
                        amount: 0.25
                    };

                    var name = doc.name;

                    if (Roles.userIsInRole(doc.owner, ['game-master'])) {
                        name = '<GM> ' + name;

                        // Later can add additional things like clans, ranks etc
                    }

                    doc.components['name-mesh'] = {
                        text: name,
                        color: Roles.userIsInRole(doc.owner, ['game-master']) ? '#4f87ee' : 'aqua',
                        stroke: '#06452d',
                        fontsize: 52,
                        fontface: 'volter_goldfishregular'
                    };

                    var ent = EntityBuilder.build(doc);
                    if (ent) {
                        // it's unlikely that the server will not want to send an entity
                        ent.addComponent('persisted', {_id: doc._id});
                        ent.addComponent('steeringBehaviour', {
                            speed: 2.5,
                            maxSpeed: 10
                        });
                        ent.addComponent('fighter', {
                            faction: 'ravenwood'
                        });


                        if (Roles.userIsInRole(doc.owner, ['game-master'])) {
                            ent.addComponent('cheats');
                        }

                        ent.owner = doc.owner;

                        // TODO: decorate entity with other components, such as "player", etc. like the client does
                        $activeWorlds[doc.level]._ownerCache[doc.owner] = ent.uuid;
                        $activeWorlds[doc.level].addEntity(ent);

                        ChatService.announce(ent.name + ' has entered the world.', {
                            join: true
                        });
                    } else {
                        console.log('error building entity for: ', doc);
                    }
                    //console.log('adding entity: ', doc.name, ' to ', doc.level, ' count: ', $activeWorlds[doc.level].getEntities().length);
                }


            };

            var userExit = function (userId) {
                _.each($activeWorlds, function (world) {
                    var playerEntities = world.getEntities('player');
                    playerEntities.forEach(function (player) {
                        if (player.owner === userId) {
                            world.removeEntity(player);

                            ChatService.announce(player.name + ' has left the world.', {
                                leave: true
                            });
                        }
                    });
                });
            };

            Meteor.users.find({
                'status.online': true,
                'profile.server.id': Meteor.settings.server.id
            }).observe({
                removed: function(user) {
                    userExit(user._id);
                }
            });

            this.leaveGame = function() {
                userExit(this.userId);
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
                                        console.log(startLevel, ' has no spawn points defined!');
                                        player.position.copy(new THREE.Vector3());
                                        player.rotation.copy(new THREE.Euler());
                                    }
                                    else {
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

                                    player.level = startLevel;
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
