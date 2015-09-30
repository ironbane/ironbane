angular
    .module('engine.input.input-system', [
        'ces',
        'ces.signal',
        'engine.input.keyboard',
        'engine.input.mouse',
        'engine.input.keys',
        'engine.input.virtual-gamepad',
        'engine.input.gamepadMgr',
        'engine.input.actionMap'
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
            '$log',
            'System',
            'Keyboard',
            'Mouse',
            'VirtualGamepad',
            'KEYS',
            'MOUSE_BUTTONS',
            'Signal',
            'GamepadMgr',
            'GAMEPAD',
            'ActionMap',
            function($log, System, Keyboard, Mouse, VirtualGamepad, KEYS, MOUSE_BUTTONS, Signal, GamepadMgr, GAMEPAD, ActionMap) {
                var InputSystem = System.extend({
                    init: function() {
                        var sys = this;

                        this.keyboard = new Keyboard();

                        this.mouse = new Mouse();

                        // TODO: enable / disable this based on settings / need
                        this.virtualGamepad = new VirtualGamepad();
                        this.virtualGamepad.draw();

                        this.gamepadMgr = new GamepadMgr();

                        this.KEYS = KEYS;

                        // build signals for all action mappings
                        // they need to be pre-defined in .config
                        this.actions = {};
                        angular.forEach(_actionMappings, function(mappings, action) {
                            sys.actions[action] = new Signal();
                        });

                        this._actionMaps = {};
                    },
                    getActionMap: function(mapName) {
                        if (!this._actionMaps[mapName]) {
                            this._actionMaps[mapName] = new ActionMap(this);
                        }

                        return this._actionMaps[mapName];
                    },
                    update: function() {
                        var sys = this;

                        this.gamepadMgr.update();

                        // check if action mapping conditions have been met
                        // if so, emit action event
                        angular.forEach(_actionMappings, function(mappings, action) {
                            angular.forEach(mappings, function(mapping) {
                                var testFn;
                                // for the moment, just going to support single key actions
                                if (mapping.type === 'keyboard') {
                                    testFn = mapping.check === 'pressed' ?
                                        sys.keyboard.getKeyDown.bind(sys.keyboard) : sys.keyboard.getKey.bind(sys.keyboard);

                                    if (testFn(sys.KEYS[mapping.keys[0]])) {
                                        sys.actions[action].emit(action);
                                    }
                                }

                                if (mapping.type === 'mouse') {
                                    testFn = mapping.check === 'pressed' ?
                                        sys.mouse.getButtonDown.bind(sys.mouse) : sys.mouse.getButton.bind(sys.mouse);

                                    if (testFn(MOUSE_BUTTONS[mapping.keys[0]])) {
                                        sys.actions[action].emit(action);
                                    }
                                }

                                if (mapping.type === 'gamepad') {
                                    if (mapping.check === 'pressed') {
                                        testFn = sys.gamepadMgr.pad1.justPressed(GAMEPAD[mapping.keys[0]]);
                                    }

                                    if (mapping.check === 'released') {
                                        testFn = sys.gamepadMgr.pad1.justReleased(GAMEPAD[mapping.keys[0]]);
                                    }

                                    if (mapping.check === 'down') {
                                        testFn = sys.gamepadMgr.pad1.isDown(GAMEPAD[mapping.keys[0]]);
                                    }

                                    if (testFn) {
                                        sys.actions[action].emit(action);
                                    }
                                }
                            });
                        });
                    },
                    register: function(action, callback) {
                        // $log.debug('register input: ', action, callback);
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
