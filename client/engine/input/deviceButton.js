/*
 * adapted from:
 * @license      {@link https://github.com/photonstorm/phaser/blob/master/license.txt|MIT License}
 */
angular
    .module('engine.input.deviceButton', [
        'engine.timing'
    ])
    .factory('DeviceButton', [
        '$timing',
        function($timing) {
            'use strict';

            var DeviceButton = function(device, buttonCode) {
                this.parent = device;
                this.buttonCode = buttonCode;

                this.reset();
            };

            DeviceButton.prototype.reset = function() {
                this.value = 0;

                this.isDown = false;
                this.isUp = true;

                this._timeDown = 0;
                this._timeUp = 0;
            };

            DeviceButton.prototype.press = function(value) {
                if (this.isDown) {
                    return;
                }

                this.isDown = true;
                this.isUp = false;

                this.value = value;

                this._timeDown = $timing.elapsed;
            };

            DeviceButton.prototype.release = function(value) {
                if (this.isUp) {
                    return;
                }

                this.isUp = true;
                this.isDown = false;

                this.value = value;

                this._timeUp = $timing.elapsed;
            };

            // for analogs
            DeviceButton.prototype.move = function(value) {
                this.value = value;
            };

            // The duration in ms below which the button is considered as being just pressed.
            DeviceButton.prototype.justPressed = function(duration) {
                duration = duration || 250;

                return (this.isDown && (this._timeDown + duration) > $timing.elapsed);
            };

            // The duration in ms below which the button is considered as being just released.
            DeviceButton.prototype.justReleased = function(duration) {
                duration = duration || 250;

                return (this.isUp && (this._timeUp + duration) > $timing.elapsed);
            };

            DeviceButton.prototype.destroy = function() {
                this.parent = null;
                this.buttonCode = null;
            };

            Object.defineProperty(DeviceButton.prototype, 'duration', {
                get: function() {
                    if (this.isUp) {
                        return -1;
                    }

                    return $timing.elapsed - this._timeDown;
                }
            });

            return DeviceButton;
        }
    ]);
