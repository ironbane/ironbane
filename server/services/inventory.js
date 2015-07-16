angular
    .module('server.services.inventory', [
        'models'
    ])
    .run([
        'InventoryCollection',
        'EntitiesCollection',
        function(InventoryCollection, EntitiesCollection) {
            'use strict';
        
            Meteor.publish('inventory', function(characterId) {
                return InventoryCollection.find({
                    userId: this.userId,
                    charId: characterId
                });
            });
        }
    ]);
