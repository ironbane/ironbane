angular.module('engine.input.keyboard', [])
    .factory('Keyboard', function () {
        'use strict';

        var Keyboard = function () {
            this.keysDown = {};
            this.keysDownOnce = {};

            // TODO: target and focus canvas instead so that UI overlay can function?
            window.addEventListener('keydown', this._onKeyDown.bind(this));
            window.addEventListener('keyup', this._onKeyUp.bind(this));
            window.addEventListener('blur', this._onBlur.bind(this));
        };

        Keyboard.prototype._onKeyDown = function (e) {
            // TODO only preventDefault for specific keys
            // can't access dev tools otherwise
            // e.preventDefault();

            if (!this.keysDown[e.keyCode]) {
            	this.keysDownOnce[e.keyCode] = true;
            }

            this.keysDown[e.keyCode] = true;

        };

        Keyboard.prototype._onKeyUp = function (e) {
            // TODO only preventDefault for specific keys
            // can't access dev tools otherwise
            // e.preventDefault();

            this.keysDown[e.keyCode] = false;
        };

        Keyboard.prototype._onBlur = function (e) {
            this.keysDown = {};
            this.keysDownOnce = {};
        };

        Keyboard.prototype.getKey = function (code) {
            return this.keysDown[code] === true;
        };

        Keyboard.prototype.getKeyDown = function (code) {
            if (this.keysDownOnce[code] === true) {
            	this.keysDownOnce[code] = false;
            	return true;
            }
			return false;
        };

        // TODO: run update loop on this to test for Pressed and Sequences

        return Keyboard;
    });
