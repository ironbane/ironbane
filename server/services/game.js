angular
    .module('server.services.game', [
        'models',
        'global.constants'
    ])
    .service('GameService', [
        'EntitiesCollection',
        '$activeWorlds',
        'IB_CONSTANTS',
        function(EntitiesCollection, $activeWorlds, IB_CONSTANTS) {
            'use strict';

            this.enterGame = function(charId) {
                var user = Meteor.user();

                var character = EntitiesCollection.findOne({
                    active: true,
                    owner: user._id
                });

                if (character) {
                    // Just a safety to make sure you can't play on the same account in two game instances
                    // This is assuming the code for logout/disconnect isn't buggy
                    // as was the case with old IB...
                    throw new Meteor.Error('activeCharFound', 'You are already in-game!');
                }

                var characterToEnter = EntitiesCollection.findOne({
                    _id: charId,
                    owner: user._id
                });

                if (!characterToEnter) {
                    throw new Meteor.Error('charToEnterNotFound', 'Character not found.');
                }

                EntitiesCollection.update({
                    _id: characterToEnter._id
                }, {
                    $set: {
                        active: true
                    }
                });

            };

            this.leaveGame = function() {
                var user = Meteor.user();

                EntitiesCollection.update({
                    owner: user._id
                }, {
                    $set: {
                        active: false
                    }
                }, {
                    multi: true
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
