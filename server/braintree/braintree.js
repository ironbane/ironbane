angular
    .module('server.services.braintree', [
        'global.constants',
        'models.transactions',
        'server.services.hipchat'
    ])
    // .run(function(IB_CONSTANTS, HipChat, TransactionsCollection) {
    //     'use strict';

    //     var braintree = Meteor.npmRequire('braintree');
    //     var gateway;

    //     var btAuth = {
    //         dev: {
    //             environment: braintree.Environment.Sandbox,
    //             publicKey: 'n67tqmn4njr9r2zs',
    //             privateKey: '81bd974c0265560204e5b42906debc75',
    //             merchantId: 'mnyv5zhrfr6f82nn'
    //         },
    //         prod: {
    //             environment: braintree.Environment.Sandbox,
    //             publicKey: 'n67tqmn4njr9r2zs',
    //             privateKey: '81bd974c0265560204e5b42906debc75',
    //             merchantId: 'mnyv5zhrfr6f82nn'
    //         }
    //     };

    //     var btEnvAuth = IB_CONSTANTS.isDev ? btAuth.dev : btAuth.prod;

    //     Meteor.startup(function() {
    //         gateway = braintree.connect(btEnvAuth);
    //     });

    //     Meteor.methods({
    //         getClientToken: function(clientId) {
    //             var generateToken = Meteor.wrapAsync(gateway.clientToken.generate, gateway.clientToken);
    //             var options = {};

    //             if (clientId) {
    //                 options.clientId = clientId;
    //             }

    //             var response = generateToken(options);

    //             return response.clientToken;
    //         },
    //         createTransaction: function(data) {

    //             if (!this.userId) {
    //                 throw new Meteor.Error('not-logged-in', 'You need to be logged in before you can make a purchase!');
    //             }

    //             var user = Meteor.users.findOne(this.userId);

    //             if (user.profile && user.profile.guest) {
    //                 throw new Meteor.Error('not-logged-in-guest', 'You need to be logged in before you can make a purchase!');
    //             }

    //             if (!data.pack) {
    //                 throw new Meteor.Error('no-pack', 'There was no pack associated with the purchase!');
    //             }

    //             var packThatWasBought = IB_CONSTANTS.ironbloodPacks[data.pack];

    //             if (!packThatWasBought) {
    //                 throw new Meteor.Error('bad-pack', 'The pack that you are trying to buy cannot be found!');
    //             }

    //             var transaction = Meteor.wrapAsync(gateway.transaction.sale, gateway.transaction);

    //             var amount = packThatWasBought.dollars;

    //             var response = transaction({
    //                 amount: amount,
    //                 paymentMethodNonce: data.nonce,
    //                 // customer: {
    //                 //     firstName: data.firstName
    //                 // },
    //                 options: {
    //                     submitForSettlement: true
    //                 }
    //             });

    //             if (response.success) {
    //                 // Update the user's Ironblood
    //                 Meteor.users.update(this.userId, {
    //                     $inc: {
    //                         'profile.dollarsSpent': packThatWasBought.dollars,
    //                         'profile.ironblood': packThatWasBought.ironblood
    //                     }
    //                 });

    //                 if (!IB_CONSTANTS.isDev) {
    //                     HipChat.postMessage('Ironbane Chillout', user.username + ' bought ' + packThatWasBought.ironblood + ' Ironblood for $' + amount+ '.');
    //                 }

    //                 TransactionsCollection.insert({
    //                     type: 'ironblood',
    //                     buyerId: user._id,
    //                     buyerName: user.username,
    //                     buyerEmail: user.email,
    //                     pack: packThatWasBought
    //                 });
    //             }

    //             return response;
    //         }
    //     });

    // });