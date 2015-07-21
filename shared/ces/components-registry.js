angular.module('ces.components-registry', ['ces.component'])
    .provider('$components', function() {
        'use strict';

        var _preload = {};

        this.register = function(data) {
            angular.extend(_preload, data);
        };

        this.$get = [
            'Component',
            '$log',
            function(Component, $log) {
                var _components = {},
                    _initialized = false,
                    svc = function() {};

                svc.init = function() {
                    if (_initialized) {
                        return;
                    }

                    for (var key in _preload) {
                        this.registerComponent(key, _preload[key]);
                    }
                    _initialized = true;
                };

                svc.registerComponent = function(name, data) {
                    // just stores the valid defaults
                    _components[name] = data;
                };

                svc.get = function(name, data) {
                    var c;
                    try {
                        if (!_components[name]) {
                            throw new Error('Component ' + name + ' not registered!');
                        }

                        c = new Component(name, _components[name]);

                        for (var prop in data) {
                            c[prop] = data[prop];
                        }

                        c.setIsDirty(false);
                    } catch (err) {
                        $log.debug('error instantiating component: ', err);
                    }

                    return c;
                };

                return svc;
            }
        ];

    })
    .run([
        '$components',
        function($components) {
            'use strict';

            $components.init();
        }
    ]);
