angular.module('engine.input.input-system', [
    'ces',
    'engine.input.keyboard',
    'engine.input.keys',
    'engine.input.virtual-gamepad'
])
    .factory('InputSystem', function (System, Keyboard, VirtualGamepad, KEYS) {
        var InputSystem = System.extend({
            init: function () {
                this.keyboard = new Keyboard();

                // TODO: enable / disable this based on settings / need
                this.virtualGamepad = new VirtualGamepad();
                this.virtualGamepad.draw();

                this.KEYS = KEYS;
            },
            update: function () {
                // not yet implemented...
            }
        });

        return InputSystem;
    });
