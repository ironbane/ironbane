angular.module('ces.components-registry', ['ces.component'])
    .provider('$components', function () {
        'use strict';

        var _preload = {};

        this.addComponentData = function (data) {
            angular.extend(_preload, data);
        };

        this.$get = [
            'Component',
            function (Component) {
                var _components = {},
                    _initialized = false,
                    svc = function () {};

                svc.init = function () {
                    if (_initialized) {
                        return;
                    }

                    for (var key in _preload) {
                        this.registerComponent(key, _preload[key]);
                    }
                    _initialized = true;
                };

                svc.registerComponent = function (name, data) {
                    var component = new Component();

                    component.name = name;

                    angular.extend(component, data);

                    _components[name] = component;
                };

                svc.get = function (name, data) {
                    var c = Object.create(_components[name]);

                    angular.extend(c, data);

                    return c;
                };

                return svc;
            }
        ];

    })
    .run([
        '$components',
        function ($components) {
            'use strict';

            $components.init();
        }
    ]);