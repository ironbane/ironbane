/*global Assets*/
angular
    .module('server.services.items', [
        'models.items',
        'global.constants'
    ])
    .run([
        'ItemsCollection',
        '$q',
        '$log',
        'IB_CONSTANTS',
        function(ItemsCollection, $q, $log, IB_CONSTANTS) {
            'use strict';

            var parse = Meteor.npmRequire('csv-parse');
            var request = Meteor.npmRequire('request');

            // we want to seed the item templates from the spreadsheet (csv) every time
            ItemsCollection.remove({});

            function loadData(filename) {
                var deferred = $q.defer();

                function loadCsv(text) {
                    var parser = parse(text, {
                        delimiter: ',',
                        auto_parse: true
                    }, function(err, data) {
                        if (err) {
                            return deferred.reject(err);
                        }

                        deferred.resolve(data);
                    });

                    return parser;
                }

                // assume if there's an http protocol that we're using remote files,
                // otherwise in the privates
                if (filename.search(/http/) >= 0) {
                    request(filename, function(error, response, body) {
                        if (!error && response.statusCode === 200) {
                            loadCsv(body);
                        } else {
                            deferred.reject(error);
                        }
                    });
                } else {
                    Assets.getText(filename, function(err, text) {
                        if (err) {
                            return deferred.reject(err);
                        }

                        loadCsv(text);
                    });
                }

                return deferred.promise;
            }

            function getValue(row, headers, header) {
                return row[headers.indexOf(header)];
            }

            var mapping = {
                name: 'Name',
                type: 'Type',
                image: 'Image',
                invImage: 'Inventory Image',
                damage: 'Damage',
                armor: 'Armor',
                rarity: 'Rarity',
                range: 'Range',
                projectileSpeed: 'Projectile Speed',
                attackCooldown: 'Attack Cooldown',
                handedness: 'Handedness',
                price: 'Buy Price',
                dropChance: 'Drop Chance %'
            };

            var contentFile = (Meteor.settings.content && Meteor.settings.content.items) ? Meteor.settings.content.items :
                (IB_CONSTANTS.isDev ? 'https://docs.google.com/spreadsheets/d/1ZC-ydW7if6Ci0TytsSLaio0LMoCntQwaUkXAOwjn7Y8/pub?output=csv' : 'items.csv');

            $log.debug('loading items db...');

            loadData(contentFile).then(Meteor.bindEnvironment(function(data) {
                var headers, rows;

                rows = data;
                headers = rows.shift();

                rows.forEach(function(row) {
                    var item = {};
                    for(var key in mapping) {
                        item[key] = getValue(row, headers, mapping[key]);
                    }

                    item.id = ItemsCollection.insert(item);
                });

                $log.debug('loaded ' + rows.length + ' items into collection.');
            }), function(err) {
                $log.debug('Error loading items! ', err.message);
            });

            Meteor.publish('items', function() {
                return ItemsCollection.find({});
            });
        }
    ]);
