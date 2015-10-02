angular
    .module('server.services.profiler', [])
    .run(function() {
        if (Meteor.settings.enableProfiler) {
            Meteor.npmRequire('appdynamics').profile({
                controllerHostName: 'paid139.saas.appdynamics.com',
                controllerPort: 443, // If SSL, be sure to enable the next line
                controllerSslEnabled: true, // Optional - use if connecting to controller via SSL
                accountName: 'Oneapp5120',
                accountAccessKey: 'pvmqc35futfg',
                applicationName: 'ironbane',
                tierName: 'node1',
                nodeName: 'process' // The controller will automatically append the node name with a unique number
            });

            console.log('Started profiler');
        }
    });