angular
    .module('engine.input.mouse', [])
    .constant('MOUSE_BUTTONS', {
        'MOUSE_BUTTON_LEFT': 0,
        'MOUSE_BUTTON_MIDDLE': 1,
        'MOUSE_BUTTON_RIGHT': 2
    })
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
        };

        Mouse.prototype._onMouseMove = function(event) {
            event.preventDefault();

            this.mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
            this.mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
        };

        Mouse.prototype._onMouseDown = function(event) {
            // Only allow the mouse to be triggered on the canvas
            // Maybe this could be moved somewhere else
            if (['canvas','input','a','button'].indexOf(event.target.nodeName.toLowerCase()) === -1) {
                event.preventDefault();
                return;
            }

            if (!this.buttonsDown[event.button]) {
                this.buttonsDownOnce[event.button] = true;
            }

            this.buttonsDown[event.button] = true;
        };

        Mouse.prototype._onMouseUp = function(event) {
            this.buttonsDown[event.button] = false;
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
