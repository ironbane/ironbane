/*global Collections:true, Entities: true*/
angular
    .module('server.gameService', [])
    .service('GameService', [
        function() {
            'use strict';

            this.enterGame = function(charId) {
                var user = Meteor.user();

                var character = Entities.findOne({
                    active: true,
                    owner: user._id
                });

                if (character) {
                    // Just a safety to make sure you can't play on the same account in two game instances
                    // This is assuming the code for logout/disconnect isn't buggy
                    // as was the case with old IB...
                    throw new Meteor.Error('activeCharFound', 'You are already in-game!');
                }

                var characterToEnter = Entities.findOne({
                    _id: charId,
                    owner: user._id
                });

                if (!characterToEnter) {
                    throw new Meteor.Error('charToEnterNotFound', 'Character not found.');
                }

                Entities.update({
                    _id: characterToEnter._id
                }, {
                    $set: {
                        active: true
                    }
                });
            };

            this.leaveGame = function() {
                var user = Meteor.user();

                Entities.update({
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
