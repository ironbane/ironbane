angular.module('engine.input.mouse', [])
	.factory('Mouse', function() {
		'use strict';

		var Mouse = function() {
			this.buttonsDown = {};
			this.buttonsDownOnce = {};

			this.mouse = {};

			// TODO: target and focus canvas instead so that UI overlay can function?
			window.addEventListener('mousemove', this._onMouseMove.bind(this));
			window.addEventListener('mousedown', this._onMouseDown.bind(this));
			window.addEventListener('mouseup', this._onMouseUp.bind(this));
			// window.addEventListener('blur', this._onBlur.bind(this));
		};

		Mouse.prototype._onMouseMove = function(e) {

			event.preventDefault();

			this.mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
			this.mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;

		}

		Mouse.prototype._onMouseDown = function(e) {
			// TODO only preventDefault for specific keys
			// can't access dev tools otherwise
			// e.preventDefault();

			if (!this.buttonsDown[e.button]) {
				this.buttonsDownOnce[e.button] = true;
			}

			this.buttonsDown[e.button] = true;

		};

		Mouse.prototype._onMouseUp = function(e) {
			// TODO only preventDefault for specific keys
			// can't access dev tools otherwise
			// e.preventDefault();

			this.buttonsDown[e.button] = false;
		};

		Mouse.prototype.getPosition = function() {
			return this.mouse;
		};

		Mouse.prototype.getButton = function(code) {
			return this.buttonsDown[code] === true;
		};

		Mouse.prototype.getButtonDown = function(code) {
			if (this.buttonsDownOnce[code] === true) {
				this.buttonsDownOnce[code] = false;
				return true;
			}
			return false;
		};

		return Mouse;
	});
