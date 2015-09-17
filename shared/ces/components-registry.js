angular.module('ces.components-registry', ['ces.component'])
    .provider('$components', function() {
        'use strict';

        var _preload = {},
            _preloadShared = {};

        this.register = function(data) {
            angular.extend(_preload, data);
        };
        // TODO: prevent duplicate name registrations across collections
        this.registerShared = function(data) {
            angular.extend(_preloadShared, data);
        };

        this.$get = [
            'Component',
            '$log',
            function(Component, $log) {
                var _components = {},
                    _sharedComponents = {},
                    _initialized = false,
                    svc = function() {};

                svc.init = function() {
                    if (_initialized) {
                        return;
                    }

                    for (var componentName in _preload) {
                        this.registerComponent(componentName, _preload[componentName]);
                    }

                    for (var sComponentName in _preloadShared) {
                        this.registerSharedComponent(sComponentName, _preloadShared[sComponentName]);
                    }

                    _initialized = true;
                };

                svc.registerComponent = function(name, data) {
                    // just stores the valid defaults
                    _components[name] = data;
                };

                svc.registerSharedComponent = function(name, data) {
                    // a shared component is basically a singleton instance,
                    // there should be no reason all entities can't share the same reference
                    _sharedComponents[name] = new Component(name, data);
                };

                svc.get = function(name, data) {
                    var c;

                    try {
                        if (_components[name]) {
                            c = new Component(name, _components[name]);
                        }

                        if (!c && _sharedComponents[name]) {
                            c = _sharedComponents[name];
                        }

                        if (!c) {
                            throw new Error('Component ' + name + ' not registered!');
                        } else {
                            for (var prop in data) {
                                c[prop] = data[prop];
                            }

                            c.setIsDirty(false);
                        }
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
