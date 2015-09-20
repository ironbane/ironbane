angular
    .module('ces.pooledComponent', [
        'ces.component'
    ])
    .factory('PooledComponent', [
        'Component',
        function(Component) {
            'use strict';

            function PooledComponent(name, props) {
                Component.call(this, name, props);
            }

            PooledComponent.prototype = Object.create(Component.prototype);
            PooledComponent.prototype.constructor = PooledComponent;

            PooledComponent.prototype.reset = function() {
                // subclass should override
            };

            return PooledComponent;
        }
    ]);
