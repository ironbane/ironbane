angular.module('engine.input.keyboard', [])
    .factory('Keyboard', function () {
        'use strict';

        var Keyboard = function () {
            this.keys = {};

            // TODO: target and focus canvas instead so that UI overlay can function?
            window.addEventListener('keydown', this._onKeyDown.bind(this));
            window.addEventListener('keyup', this._onKeyUp.bind(this));
            window.addEventListener('blur', this._onBlur.bind(this));
        };

        Keyboard.prototype._onKeyDown = function (e) {
            // TODO only preventDefault for specific keys
            // can't access dev tools otherwise
            // e.preventDefault();

            this.keys[e.keyCode] = true;
        };

        Keyboard.prototype._onKeyUp = function (e) {
            // TODO only preventDefault for specific keys
            // can't access dev tools otherwise
            // e.preventDefault();

            this.keys[e.keyCode] = false;
        };

        Keyboard.prototype._onBlur = function (e) {
            this.keys = {};
        };

        Keyboard.prototype.isDown = function (code) {
            return this.keys[code] === true;
        };

        // TODO: run update loop on this to test for Pressed and Sequences

        return Keyboard;
    });
