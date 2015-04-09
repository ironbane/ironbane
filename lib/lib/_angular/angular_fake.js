// this should get DI setup so that we can use shared code on the server
if (Meteor.isServer) {
    angular = di;

    // have to fake a bunch of angular stuff for the server...
    angular.extend = _.extend;
    angular.forEach = _.each;

    var ng = angular.module('ng', []);

    (function(fakeWindow) {
        'use strict';

        ng.service('$window', function() {
            return fakeWindow;
        });
    })(this);

    ng.service('$log', function() {
        'use strict';

        return console;
    });
}
