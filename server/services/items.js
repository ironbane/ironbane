angular
    .module('server.services.items', [
        'models'
    ])
    .run([
        'ItemsCollection',
        function(ItemsCollection) {
            'use strict';

            // seed the db if needed
            if (ItemsCollection.find({}).count() === 0) {
                // TODO: populate from json?

                var items = [
                    {
                        name: 'Dull Sword',
                        value: 1,
                        damage: 1,
                        type: '1hWeapon',
                        image: 14
                    },
                    {
                        name: 'Wooden Chest Plate',
                        value: 1,
                        armor: 1,
                        type: 'body',
                        image: 1
                    },
                    {
                        name: 'Wooden Helmet',
                        value: 1,
                        armor: 1,
                        type: 'head',
                        image: 1
                    },
                    {
                        name: 'Wooden Boots',
                        value: 1,
                        armor: 1,
                        type: 'feet',
                        image: 1
                    },
                ];

                _.each(items, function(item) {
                    ItemsCollection.insert(item);
                });
            }

            Meteor.publish('items', function() {
                return ItemsCollection.find({});
            });
        }
    ]);
