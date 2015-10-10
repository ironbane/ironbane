// this should get DI setup so that we can use shared code on the server
if (Meteor.isServer) {
    angular = di;

    // have to fake a bunch of angular stuff for the server...
    angular.extend = _.extend;
    angular.forEach = _.each;

    angular.isUndefined = function isUndefined(value) {
        'use strict';
        return typeof value === 'undefined';
    };

    angular.isDefined = function isDefined(value) {
        'use strict';
        return typeof value !== 'undefined';
    };

    angular.isFunction = function isFunction(value) {
        'use strict';
        return typeof value === 'function';
    };

    angular.isArray = Array.isArray;

    angular.isObject = function isObject(value) {
        'use strict';
        // http://jsperf.com/isobject4
        return value !== null && typeof value === 'object';
    };

    function isString(value) {
        'use strict';
        return typeof value === 'string';
    }

    angular.isString = isString;

    angular.lowercase = function(string) {
        'use strict';
        return isString(string) ? string.toLowerCase() : string;
    };
    angular.uppercase = function(string) {
        'use strict';
        return isString(string) ? string.toUpperCase() : string;
    };

    var ng = angular.module('ng', []);

    (function(fakeWindow) {
        'use strict';

        ng.service('$window', function() {
            return fakeWindow;
        });
    })(this);

    ng.service('$log', function() {
        'use strict';

        return {
            log: console.log,
            warn: console.log,
            error: console.log,
            debug: console.log
        };
    });

    ng.service('$http', function() {
        'use strict';
        // TODO: wrap Meteor.HTTP?
    });

    ng.service('$rootScope', function() {
        'use strict';
    });
}
