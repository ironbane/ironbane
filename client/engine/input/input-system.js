angular
    .module('engine.input.input-system', [
        'ces',
        'ces.signal',
        'engine.input.keyboard',
        'engine.input.mouse',
        'engine.input.keys',
        'engine.input.virtual-gamepad'
    ])
    .provider('InputSystem', function() {
        'use strict';

        var _actionMappings = {};

        this.setActionMapping = function(action, mappings) {
            if (!angular.isArray(mappings)) {
                mappings = [mappings];
            }

            _actionMappings[action] = mappings;
        };

        this.$get = [
            'System',
            'Keyboard',
            'Mouse',
            'VirtualGamepad',
            'KEYS',
            'Signal',
            function(System, Keyboard, Mouse, VirtualGamepad, KEYS, Signal) {
                var InputSystem = System.extend({
                    init: function() {
                        var sys = this;

                        this.keyboard = new Keyboard();

                        this.mouse = new Mouse();

                        // TODO: enable / disable this based on settings / need
                        this.virtualGamepad = new VirtualGamepad();
                        this.virtualGamepad.draw();

                        this.KEYS = KEYS;

                        // build signals for all action mappings
                        // they need to be pre-defined in .config
                        this.actions = {};
                        angular.forEach(_actionMappings, function(mappings, action) {
                            sys.actions[action] = new Signal();
                        });
                    },
                    update: function() {
                        var sys = this;

                        // check if action mapping conditions have been met
                        // if so, emit action event
                        angular.forEach(_actionMappings, function(mappings, action) {
                            angular.forEach(mappings, function(mapping) {
                                // for the moment, just going to support single key actions
                                if (mapping.type === 'keyboard') {
                                    var testFn = mapping.check === 'pressed' ?
                                        sys.keyboard.getKeyDown.bind(sys.keyboard) : sys.keyboard.getKey.bind(sys.keyboard);

                                    if (testFn(sys.KEYS[mapping.keys[0]])) {
                                        sys.actions[action].emit();
                                    }
                                }
                            });
                        });
                    },
                    register: function(action, callback) {
                        if (this.actions[action]) {
                            this.actions[action].add(callback);
                        }
                    },
                    unregister: function(action, callback) {
                        if (this.actions[action]) {
                            this.actions[action].remove(callback);
                        }
                    }
                });

                return InputSystem;
            }
        ];
    });
