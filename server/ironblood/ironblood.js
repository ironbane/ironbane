angular
    .module('server.services.ironblood', [
        'global.constants',
        'models.transactions',
        'server.services.hipchat'
    ])
    .run(function(IB_CONSTANTS, HipChat, TransactionsCollection) {
        'use strict';

        Meteor.methods({
            buyItem: function(itemName) {

                if (!this.userId) {
                    throw new Meteor.Error('not-logged-in', 'You need to be logged in before you can make a purchase!');
                }

                var user = Meteor.users.findOne(this.userId);

                if (user.profile && user.profile.guest) {
                    throw new Meteor.Error('not-logged-in-guest', 'You need to be logged in before you can make a purchase!');
                }

                var price = IB_CONSTANTS.ironbloodRates[itemName];

                if (!price) {
                    throw new Meteor.Error('price-not-found', 'The item you are trying to buy was not found!');
                }

                if (price > user.profile.ironblood) {
                    throw new Meteor.Error('not-enough-ironblood', 'You do not have enough Ironblood!');
                }

                if (itemName === 'extraCharacterSlot') {
                    Meteor.users.update(this.userId, {
                        $inc: {
                            'profile.maxCharactersAllowed': 1
                        }
                    });
                }
                else {
                    throw new Meteor.Error('item-not-found', 'The item you are trying to buy was not found!');
                }

                Meteor.users.update(this.userId, {
                    $inc: {
                        'profile.ironblood': -price
                    }
                });

                TransactionsCollection.insert({
                    type: itemName,
                    buyerId: user._id,
                    buyerName: user.username,
                    buyerEmail: user.email,
                    ironblood: price
                });

                return true;
            }
        });

    });