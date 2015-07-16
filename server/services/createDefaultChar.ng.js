angular
    .module('server.services.createDefaultChar', [
        'models',
        'global.constants',
        'server.services.character'
    ])
    .run(function(IB_CONSTANTS, AccountsCollection, RolesCollection, ZonesCollection, CharacterService, InventoryCollection) {
            'use strict';

            if (IB_CONSTANTS.isDev) {
                // Create a default user and character
                if (Meteor.users.find({}).count() === 0) {
                    var userId = AccountsCollection.createUser({
                        username: 'admin',
                        password: 'admin'
                    });

                    RolesCollection.addUsersToRoles(userId, ['game-master']);

                    var zonesCursor = ZonesCollection.find({});
                    var observer = zonesCursor.observe({
                        added: function(doc) {
                            Meteor.setTimeout(function () {
                                if (doc.name === 'ravenwood') {
                                    // Also create a character
                                    var gender = 'male';
                                    var options = {
                                        charName: 'test',
                                        boy: true,
                                        skin: IB_CONSTANTS.characterParts[gender].skin[0],
                                        eyes: IB_CONSTANTS.characterParts[gender].eyes[0],
                                        hair: IB_CONSTANTS.characterParts[gender].hair[0]
                                    };

                                    var charId = CharacterService.create(options, Meteor.users.findOne(userId));                  

                                    var inventory = {
                                        userId: userId,
                                        charId: charId,
                                        bar: {                                        
                                            'lhand': {
                                                name: 'Dull Sword',
                                                value: 1,
                                                damage: 1,
                                                type: '1hWeapon',
                                                spriteIndexX: 10,
                                                spriteIndexY: 97
                                            },
                                            'body': {
                                                name: 'Wooden Chest Plate',
                                                value: 1,
                                                armor: 1,
                                                type: 'body',
                                                spriteIndexX: 1,
                                                spriteIndexY: 0
                                            },
                                            'slot0': {
                                                name: 'Wooden Helmet',
                                                value: 1,
                                                armor: 1,
                                                type: 'head',
                                                spriteIndexX: 1,
                                                spriteIndexY: 0
                                            },
                                            'slot5': {
                                                name: 'Wooden Boots',
                                                value: 1,
                                                armor: 1,
                                                type: 'feet',
                                                spriteIndexX: 1,
                                                spriteIndexY: 0
                                            },
                                            'slot7': {
                                                name: 'Potion',
                                                value: 1,
                                                type: 'potion',
                                                quantity: 1,
                                                spriteIndexX: 1,
                                                spriteIndexY: 0
                                            }
                                        }
                                    };

                                    InventoryCollection.insert(inventory);                                                                        

                                    observer.stop();                            
                                }
                            }, 1000);
                        }
                    });

                }
            }
        }
    );
