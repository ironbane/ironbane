angular
    .module('server.boot.makeServers', [
        'models'
    ])
    .run([
        'ServersCollection',
        function(ServersCollection) {
            'use strict';

            var serverNames = [
                'US East',
                'US West',
                'EU East',
                'EU West'
            ];

            if (ServersCollection.find({}).count() === 0) {
                serverNames.forEach(function (serverName) {
                    ServersCollection.insert({
                        name: serverName
                    });
                });
            }

        }
    ]);
