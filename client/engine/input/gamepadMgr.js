angular
    .module('engine.input.gamepadMgr', [
        'ces.pubsub',
        'engine.input.gamepad'
    ])
    .factory('GamepadMgr', [
        'Gamepad',
        'CESPubSub',
        function(Gamepad, CESPubSub) {
            'use strict';

            var MAX_GAMEPADS = 4;

            var curryPadHandler = function(pad, handler) {
                return function() {
                    var context = this,
                        args = Array.prototype.slice.call(arguments);

                    args.unshift(pad);

                    handler.apply(context, args);
                };
            };

            var GamepadMgr = function() {
                var self = this;

                this.enabled = true;

                this._pubsub = new CESPubSub();
                this.on = this._pubsub.subscribe.bind(this._pubsub);
                this.off = this._pubsub.unsubscribe.bind(this._pubsub);
                this.emit = this._pubsub.publish.bind(this._pubsub);

                this._rawPads = [];
                this._prevRawGamepadTypes = [];

                this._gamepads = [];

                function onConnectHandler(gamepad) {
                    self.emit('gamepad:connect', gamepad, gamepad.index);
                }

                for (var c = 0; c < MAX_GAMEPADS; c++) {
                    var pad = new Gamepad();

                    pad.on('gamepad:connect', curryPadHandler(pad, onConnectHandler));

                    this._gamepads.push(pad);
                }

                this.__onGamepadConnected = function(event) {
                    return self._onGamepadConnected(event);
                };

                this.__onGamepadDisconnected = function(event) {
                    return self._onGamepadDisconnected(event);
                };

                window.addEventListener('gamepadconnected', this.__onGamepadConnected, false);
                window.addEventListener('gamepaddisconnected', this.__onGamepadDisconnected, false);
            };

            GamepadMgr.prototype.update = function() {
                this._pollGamepads();

                this.pad1.pollStatus();
                this.pad2.pollStatus();
                this.pad3.pollStatus();
                this.pad4.pollStatus();
            };

            GamepadMgr.prototype._onGamepadConnected = function(event) {
                var newPad = event.gamepad;
                this._rawPads.push(newPad);
                this._gamepads[newPad.index].connect(newPad);
            };

            GamepadMgr.prototype._onGamepadDisconnected = function(event) {
                var removedPad = event.gamepad;

                for (var i in this._rawPads) {
                    if (this._rawPads[i].index === removedPad.index) {
                        this._rawPads.splice(i, 1);
                    }
                }

                this._gamepads[removedPad.index].disconnect();
            };

            GamepadMgr.prototype._pollGamepads = function() {
                var rawGamepads,
                    navigator = window.navigator;

                if (navigator.getGamepads) {
                    rawGamepads = navigator.getGamepads();
                } else if (navigator.webkitGetGamepads) {
                    rawGamepads = navigator.webkitGetGamepads();
                } else if (navigator.webkitGamepads) {
                    rawGamepads = navigator.webkitGamepads();
                }

                if (rawGamepads) {
                    this._rawPads = [];

                    var gamepadsChanged = false;

                    for (var i = 0; i < rawGamepads.length; i++) {
                        if (typeof rawGamepads[i] !== this._prevRawGamepadTypes[i]) {
                            gamepadsChanged = true;
                            this._prevRawGamepadTypes[i] = typeof rawGamepads[i];
                        }

                        if (rawGamepads[i]) {
                            this._rawPads.push(rawGamepads[i]);
                        }

                        // Support max 4 pads at the moment
                        if (i === MAX_GAMEPADS - 1) {
                            break;
                        }
                    }

                    if (gamepadsChanged) {
                        var validConnections = {
                            rawIndices: {},
                            padIndices: {}
                        };
                        var singlePad;

                        for (var j = 0; j < this._gamepads.length; j++) {
                            singlePad = this._gamepads[j];

                            if (singlePad.connected) {
                                for (var k = 0; k < this._rawPads.length; k++) {
                                    if (this._rawPads[k].index === singlePad.index) {
                                        validConnections.rawIndices[singlePad.index] = true;
                                        validConnections.padIndices[j] = true;
                                    }
                                }
                            }
                        }

                        for (var l = 0; l < this._gamepads.length; l++) {
                            singlePad = this._gamepads[l];

                            if (validConnections.padIndices[l]) {
                                continue;
                            }

                            if (this._rawPads.length < 1) {
                                singlePad.disconnect();
                            }

                            for (var m = 0; m < this._rawPads.length; m++) {
                                if (validConnections.padIndices[l]) {
                                    break;
                                }

                                var rawPad = this._rawPads[m];

                                if (rawPad) {
                                    if (validConnections.rawIndices[rawPad.index]) {
                                        singlePad.disconnect();
                                        continue;
                                    } else {
                                        singlePad.connect(rawPad);
                                        validConnections.rawIndices[rawPad.index] = true;
                                        validConnections.padIndices[l] = true;
                                    }
                                } else {
                                    singlePad.disconnect();
                                }
                            }
                        }
                    }
                }
            };

            // below methods for ALL gamepads

            GamepadMgr.prototype.setDeadZones = function(value) {
                for (var i = 0; i < this._gamepads.length; i++) {
                    this._gamepads[i].deadZone = value;
                }
            };

            GamepadMgr.prototype.reset = function() {
                this.update();

                for (var i = 0; i < this._gamepads.length; i++) {
                    this._gamepads[i].reset();
                }
            };

            GamepadMgr.prototype.justPressed = function(buttonCode, duration) {
                for (var i = 0; i < this._gamepads.length; i++) {
                    if (this._gamepads[i].justPressed(buttonCode, duration) === true) {
                        return true;
                    }
                }

                return false;
            };

            GamepadMgr.prototype.justReleased = function(buttonCode, duration) {
                for (var i = 0; i < this._gamepads.length; i++) {
                    if (this._gamepads[i].justReleased(buttonCode, duration) === true) {
                        return true;
                    }
                }

                return false;
            };

            GamepadMgr.prototype.isDown = function(buttonCode) {
                for (var i = 0; i < this._gamepads.length; i++) {
                    if (this._gamepads[i].isDown(buttonCode) === true) {
                        return true;
                    }
                }

                return false;
            };

            // getters / setters
            Object.defineProperty(GamepadMgr.prototype, 'padsConnected', {
                get: function() {
                    return this._rawPads.length;
                }
            });

            for (var p = 0; p < MAX_GAMEPADS; p++) {
                (function(index) {
                    Object.defineProperty(GamepadMgr.prototype, 'pad' + (index + 1), {
                        get: function() {
                            return this._gamepads[index];
                        }
                    });
                })(p);
            }

            return GamepadMgr;
        }
    ])
    .constant('GAMEPAD', {
        BUTTON_0: 0,
        BUTTON_1: 1,
        BUTTON_2: 2,
        BUTTON_3: 3,
        BUTTON_4: 4,
        BUTTON_5: 5,
        BUTTON_6: 6,
        BUTTON_7: 7,
        BUTTON_8: 8,
        BUTTON_9: 9,
        BUTTON_10: 10,
        BUTTON_11: 11,
        BUTTON_12: 12,
        BUTTON_13: 13,
        BUTTON_14: 14,
        BUTTON_15: 15,

        AXIS_0: 0,
        AXIS_1: 1,
        AXIS_2: 2,
        AXIS_3: 3,
        AXIS_4: 4,
        AXIS_5: 5,
        AXIS_6: 6,
        AXIS_7: 7,
        AXIS_8: 8,
        AXIS_9: 9,

        XBOX360_A: 0,
        XBOX360_B: 1,
        XBOX360_X: 2,
        XBOX360_Y: 3,
        XBOX360_LEFT_BUMPER: 4,
        XBOX360_RIGHT_BUMPER: 5,
        XBOX360_LEFT_TRIGGER: 6,
        XBOX360_RIGHT_TRIGGER: 7,
        XBOX360_BACK: 8,
        XBOX360_START: 9,
        XBOX360_STICK_LEFT_BUTTON: 10,
        XBOX360_STICK_RIGHT_BUTTON: 11,

        XBOX360_DPAD_LEFT: 14,
        XBOX360_DPAD_RIGHT: 15,
        XBOX360_DPAD_UP: 12,
        XBOX360_DPAD_DOWN: 13,

        XBOX360_STICK_LEFT_X: 0,
        XBOX360_STICK_LEFT_Y: 1,
        XBOX360_STICK_RIGHT_X: 2,
        XBOX360_STICK_RIGHT_Y: 3
    });
