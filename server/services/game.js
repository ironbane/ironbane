angular
    .module('server.services.game', [
        'models'
    ])
    .service('GameService', [
        'EntitiesCollection',
        '$activeWorlds',
        function(EntitiesCollection, $activeWorlds) {
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

                // first time login, we need to send all the networked entities over
                var enteringWorld = $activeWorlds[characterToEnter.level];
                if (enteringWorld) {
                    var networkSystem = enteringWorld.getSystem('network');
                    networkSystem.sendNetState(user._id);
                } else {
                    // move them somewhere valid? we have an issue...
                }
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
        }
    ])
    .run(['GameService', function(GameService) {
        'use strict';

        Meteor.methods({
            enterGame: GameService.enterGame,
            leaveGame: GameService.leaveGame
        });
    }]);
