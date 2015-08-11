/*
 * adapted from:
 * @license      {@link https://github.com/photonstorm/phaser/blob/master/license.txt|MIT License}
 */
angular
    .module('engine.input.gamepad', [
        'ces.pubsub',
        'engine.input.deviceButton'
    ])
    .factory('Gamepad', [
        'CESPubSub',
        'DeviceButton',
        function(CESPubSub, DeviceButton) {
            'use strict';

            var Gamepad = function() {
                this.connected = false;
                this.index = null;

                this.enabled = true;

                this.deadZone = 0.3;

                this._buttons = [];
                this._buttonsLen = 0;

                this._axes = [];
                this._axesLen = 0;

                this._rawPad = null;

                this._prevTimestamp = null;

                this._pubsub = new CESPubSub();
                this.on = this._pubsub.subscribe.bind(this._pubsub);
                this.off = this._pubsub.unsubscribe.bind(this._pubsub);
                this.emit = this._pubsub.publish.bind(this._pubsub);
            };

            Gamepad.prototype.connect = function(rawPad) {
                var triggerCallback = !this.connected;

                this.connected = true;
                this.index = rawPad.index;

                this._rawPad = rawPad;

                this._buttons = [];
                this._buttonsLen = rawPad.buttons.length;

                this._axes = [];
                this._axesLen = rawPad.axes.length;

                for (var a = 0; a < this._axesLen; a++) {
                    this._axes[a] = rawPad.axes[a];
                }

                for (var buttonCode in rawPad.buttons) {
                    buttonCode = parseInt(buttonCode, 10);
                    this._buttons[buttonCode] = new DeviceButton(this, buttonCode);
                }

                if (triggerCallback) {
                    this.emit('gamepad:connect');
                }
            };

            Gamepad.prototype.disconnect = function() {
                var triggerCallback = this.connected;
                var disconnectingIndex = this.index;

                this.connected = false;
                this.index = null;

                this._rawPad = undefined;

                for (var i = 0; i < this._buttonsLen; i++) {
                    this._buttons[i].destroy();
                }

                this._buttons = [];
                this._buttonsLen = 0;

                this._axes = [];
                this._axesLen = 0;

                if (triggerCallback) {
                    this.emit('gamepad:disconnect', disconnectingIndex);
                }
            };

            Gamepad.prototype.pollStatus = function() {
                if (!this.connected || !this.enabled || (this._rawPad.timestamp && (this._rawPad.timestamp === this._prevTimestamp))) {
                    return;
                }

                for (var i = 0; i < this._buttonsLen; i++) {
                    var rawButtonVal = isNaN(this._rawPad.buttons[i]) ? this._rawPad.buttons[i].value : this._rawPad.buttons[i];

                    if (rawButtonVal !== this._buttons[i].value) {
                        if (rawButtonVal === 1) {
                            this.processButtonDown(i, rawButtonVal);
                        } else if (rawButtonVal === 0) {
                            this.processButtonUp(i, rawButtonVal);
                        } else {
                            this.processButtonAnalog(i, rawButtonVal);
                        }
                    }
                }

                for (var index = 0; index < this._axesLen; index++) {
                    var value = this._rawPad.axes[index];

                    if ((value > 0 && value > this.deadZone) || (value < 0 && value < -this.deadZone)) {
                        this.processAxisChange(index, value);
                    } else {
                        this.processAxisChange(index, 0);
                    }
                }

                this._prevTimestamp = this._rawPad.timestamp;
            };

            Gamepad.prototype.processAxisChange = function(index, value) {
                if (this._axes[index] === value) {
                    return;
                }

                this._axes[index] = value;

                this.emit('gamepad:axischange', index, value);
            };

            Gamepad.prototype.processButtonDown = function(buttonCode, value) {
                this._buttons[buttonCode].press(value);

                this.emit('gamepad:buttonpressed', buttonCode);
            };

            Gamepad.prototype.processButtonUp = function(buttonCode, value) {
                this._buttons[buttonCode].release(value);

                this.emit('gamepad:buttonreleased', buttonCode);
            };

            Gamepad.prototype.processButtonAnalog = function(buttonCode, value) {
                this._buttons[buttonCode].move(value);

                this.emit('gamepad:buttonanalog', buttonCode, value);
            };

            Gamepad.prototype.axis = function(axisCode) {
                if (this._axes[axisCode]) {
                    return this._axes[axisCode];
                }

                return false;
            };

            Gamepad.prototype.isDown = function(buttonCode) {
                if (this._buttons[buttonCode]) {
                    return this._buttons[buttonCode].isDown;
                }

                return false;
            };

            Gamepad.prototype.isUp = function(buttonCode) {
                if (this._buttons[buttonCode]) {
                    return this._buttons[buttonCode].isUp;
                }

                return false;
            };

            Gamepad.prototype.justReleased = function(buttonCode, duration) {
                if (this._buttons[buttonCode]) {
                    return this._buttons[buttonCode].justReleased(duration);
                }
            };

            Gamepad.prototype.justPressed = function(buttonCode, duration) {
                if (this._buttons[buttonCode]) {
                    return this._buttons[buttonCode].justPressed(duration);
                }
            };

            Gamepad.prototype.buttonValue = function(buttonCode) {
                if (this._buttons[buttonCode]) {
                    return this._buttons[buttonCode].value;
                }

                return null;
            };

            // gets the DeviceButton instance
            Gamepad.prototype.getButton = function(buttonCode) {
                if (this._buttons[buttonCode]) {
                    return this._buttons[buttonCode];
                } else {
                    return null;
                }
            };

            Gamepad.prototype.reset = function() {
                for (var j = 0; j < this._axes.length; j++) {
                    this._axes[j] = 0;
                }
            };

            return Gamepad;
        }
    ]);
