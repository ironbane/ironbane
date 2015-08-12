angular
    .module('engine.input.actionMap', [
        'engine.input.keys',
        'engine.input.gamepadMgr',
        'engine.input.mouse'
    ])
    .factory('ActionMap', [
        '$log',
        'KEYS',
        'MOUSE_BUTTONS',
        'GAMEPAD',
        function($log, KEYS, MOUSE_BUTTONS, GAMEPAD) {
            'use strict';

            var ActionMap = function(inputSystem) {
                this._input = inputSystem;

                this._actions = {};
            };

            // flag:
            // Px pressed x times (default 1)
            // Dx held down for x duration (default min)
            // R  released
            // A+/-  within analog range (for axis)
            ActionMap.prototype.map = function(name, device, button, flag) {
                var actionMap = this,
                    input = actionMap._input,
                    testFn;

                flag = flag || 'P';

                this._actions[name] = this._actions[name] || [];

                var actions = this._actions[name];

                if (device === 'gamepad') {
                    testFn = function() {
                        var result;
                        // TODO: analog values & modifiers

                        if (flag[0] === 'P') {
                            result = input.gamepadMgr.pad1.justPressed(GAMEPAD[button]);
                        }

                        if (flag[0] === 'R') {
                            result = input.gamepadMgr.pad1.justReleased(GAMEPAD[button]);
                        }

                        if (flag[0] === 'D') {
                            result = input.gamepadMgr.pad1.isDown(GAMEPAD[button]);
                        }

                        if (flag[0] === 'A') {
                            var axis = input.gamepadMgr.pad1.axis(GAMEPAD[button]),
                                range = flag.substr(1);
                            // TODO: specify number range

                            if (range === '+') {
                                result = axis > 0;
                            } else {
                                result = axis < 0;
                            }
                        }

                        return result;
                    };
                }

                if (device === 'keyboard') {
                    testFn = function() {
                        var result;

                        if (flag[0] === 'P') {
                            result = input.keyboard.getKeyDown(KEYS[button]);
                        }

                        if (flag[0] === 'R') {
                            // TODO: enhance keyboard to support released
                            //result = input.keyboard.getKeyUp(KEYS[button]);
                        }

                        if (flag[0] === 'D') {
                            result = input.keyboard.getKey(KEYS[button]);
                        }

                        return result;
                    };
                }

                if (device === 'mouse') {
                    testFn = function() {
                        var result;

                        if (flag[0] === 'P') {
                            result = input.mouse.getButtonDown(MOUSE_BUTTONS[button]);
                        }

                        if (flag[0] === 'D') {
                            result = input.mouse.getButton(MOUSE_BUTTONS[button]);
                        }

                        // TODO: mouse to support released and x,y

                        return result;
                    };
                }

                actions.push(testFn);
            };

            ActionMap.prototype.test = function(actionName) {
                if (!this._actions[actionName]) {
                    return false;
                }

                // this action can pass regardless of the device that activates it
                return this._actions[actionName].some(function(test) {
                    return test();
                });
            };

            return ActionMap;
        }
    ]);
