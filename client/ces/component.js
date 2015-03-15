angular.module('ces.component', ['ces.class'])
    .factory('Component', function (Class) {
        'use strict';

        /**
         * The components is the container of some properties that
         * the entity possesses. It may also contain some methods.
         * @class
         */
        var Component = Class.extend({
            /**
             * Name of this component. It is expected to be overriden and
             * should be unique.
             * @public
             * @readonly
             * @property {String} name
             */
            name: ''
        });

        return Component;

    });
