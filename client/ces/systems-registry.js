angular.module('ces.systems-registry', ['ces.system'])
    .provider('$systems', function () {
        'use strict';

        var _preload = {};

        this.addPreloadData = function (data) {
            angular.extend(_preload, data);
        };

        this.$get = [
            'System',
            function (System) {
                var _systems = {},
                    _initialized = false,
                    svc = function () {};

                svc.init = function () {
                    if (_initialized) {
                        return;
                    }

                    for (var key in _preload) {
                        this.registerSystem(key, _preload[key]);
                    }
                    _initialized = true;
                };

                svc.registerSystem = function (name, data) {
                    var Sys = _systems[name] = function () {};

                    Sys.prototype = Object.create(System.prototype);
                    Sys.prototype.constructor = Sys;

                    angular.extend(Sys.prototype, data);
                };

                svc.getSystem = function (name) {
                    return new _systems[name]();
                };

                return svc;
            }
        ];

    })
    .run([
        '$systems',
        function ($systems) {
            'use strict';

            $systems.init();
        }
    ]);