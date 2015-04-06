/*global Collections:true*/
'use strict';

Collections.Achievements = new Mongo.Collection('achievements');

// For now not necessary to publish these
// if (Meteor.isServer) {
//     Meteor.publish('achievements', function() {
//         return Collections.Achievements.find({
//         	owner: this.userId
//         });
//     });
// }
