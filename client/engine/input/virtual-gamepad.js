angular.module('engine.input.virtual-gamepad', [])
    .factory('VirtualGamepad', function () {
        'use strict';

        // on detecting pointer events, create the pointer object to add to the collection
        // for different input type, show different color and text
        function createPointerObject(event) {
            //console.log('pointer event!!', event);
            var type, color;

            switch (event.pointerType) {
            case event.POINTER_TYPE_MOUSE || 'mouse':
                type = 'MOUSE';
                color = 'red';
                break;
            case event.POINTER_TYPE_PEN || 'pen':
                type = 'PEN';
                color = 'lime';
                break;
            case event.POINTER_TYPE_TOUCH || 'touch':
                type = 'TOUCH';
                color = 'cyan';
                break;
            }

            return {
                id: event.pointerId,
                x: event.clientX,
                y: event.clientY,
                type: type,
                color: color,
                start: {
                    x: event.clientX,
                    y: event.clientY
                },
                delta: {
                    x: 0,
                    y: 0,
                    vx: 0,
                    vy: 0
                }
            };
        }

        var onPointerDown = function (e) {
            var gamepad = this;

            gamepad._pointers[e.pointerId] = createPointerObject(e);

            if (e.clientX < gamepad.canvasHalfWidth) {
                if (!gamepad.leftThumbstick) {
                    gamepad.leftThumbstick = gamepad._pointers[e.pointerId];
                    gamepad.leftThumbstick.color = 'green';
                }
            } else {
                if (!gamepad.rightThumbstick) {
                    gamepad.rightThumbstick = gamepad._pointers[e.pointerId];
                    gamepad.rightThumbstick.color = 'aqua';
                }
            }
        };

        var onPointerMove = function (e) {
            var pointer = this._pointers[e.pointerId];

            if (pointer) {
                pointer.x = e.clientX;
                pointer.y = e.clientY;

                pointer.delta.x = pointer.x - pointer.start.x;
                pointer.delta.y = pointer.y - pointer.start.y;

                // normalize delta (for stick movement)
                pointer.delta.vx = pointer.delta.x / (1/(25/1000)); // sensitivity
                pointer.delta.vy = pointer.delta.y / (1/(25/1000)); // sensitivity
                pointer.delta.vx = Math.min(1, Math.max(-1, pointer.delta.vx));
                pointer.delta.vy = Math.min(1, Math.max(-1, pointer.delta.vy));
            }
        };

        var onPointerUp = function (e) {
            var gamepad = this;

            if(gamepad.leftThumbstick && gamepad.leftThumbstick.id === e.pointerId) {
                delete gamepad.leftThumbstick;
            }

            if(gamepad.rightThumbstick && gamepad.rightThumbstick.id === e.pointerId) {
                delete gamepad.rightThumbstick;
            }

            delete gamepad._pointers[e.pointerId];
        };

        var VirtualGamepad = function () {
            var gamepad = this;

            // track touches / clicks
            gamepad._pointers = {};

            // create overlay canvas
            gamepad.canvas = document.createElement('canvas');

            gamepad.canvasWidth = window.innerWidth;
            gamepad.canvasHeight = window.innerHeight;
            gamepad.canvasHalfWidth = gamepad.canvasWidth / 2;
            gamepad.canvasHalfHeight = gamepad.canvasHeight / 2;
            gamepad.canvas.width = gamepad.canvasWidth;
            gamepad.canvas.height = gamepad.canvasHeight;
            gamepad.canvas.style.width = '100%';
            gamepad.canvas.style.height = '100%';
            gamepad.canvas.style.position = 'absolute';
            gamepad.canvas.style.backgroundColor = 'transparent';
            gamepad.canvas.style.top = '0px';
            gamepad.canvas.style.left = '0px';
            gamepad.canvas.style.zIndex = '5';
            gamepad.canvas.style.msTouchAction = 'none';
            gamepad.canvas.style.touchAction = 'none';
            gamepad.canvasContext = gamepad.canvas.getContext('2d');
            gamepad.canvasContext.strokeStyle = '#ffffff';
            gamepad.canvasContext.lineWidth = 2;

            document.body.appendChild(gamepad.canvas);

            // gamepad.canvas.addEventListener('pointerdown', onPointerDown.bind(gamepad), false);
            // gamepad.canvas.addEventListener('pointermove', onPointerMove.bind(gamepad), false);
            // gamepad.canvas.addEventListener('pointerup', onPointerUp.bind(gamepad), false);
            // gamepad.canvas.addEventListener('pointerout', onPointerUp.bind(gamepad), false);
            gamepad.canvas.addEventListener('touchstart', onPointerDown.bind(gamepad), false);
            gamepad.canvas.addEventListener('touchmove', onPointerMove.bind(gamepad), false);
            gamepad.canvas.addEventListener('touchend', onPointerUp.bind(gamepad), false);
            gamepad.canvas.addEventListener('touchleave', onPointerUp.bind(gamepad), false);

            gamepad.canvas.addEventListener('contextmenu', function (e) {
                e.preventDefault(); // Disables system menu
            }, false);

            window.addEventListener('resize', function () {
                gamepad.canvasWidth = window.innerWidth;
                gamepad.canvasHeight = window.innerHeight;

                gamepad.canvasHalfWidth = gamepad.canvasWidth / 2;
                gamepad.canvasHalfHeight = gamepad.canvasHeight / 2;

                gamepad.canvas.width = gamepad.canvasWidth;
                gamepad.canvas.height = gamepad.canvasHeight;

            }, false);
        };

        VirtualGamepad.prototype.draw = function () {
            var gamepad = this,
                canvas = gamepad.canvas,
                context = gamepad.canvasContext,
                keys;

            context.clearRect(0, 0, canvas.width, canvas.height);

            keys = Object.keys(gamepad._pointers);
            keys.forEach(function (pointerId) {
                var pointer = gamepad._pointers[pointerId];

                if (gamepad.leftThumbstick && pointer.id === gamepad.leftThumbstick.id) {
                    //context.beginPath();
                    //context.fillStyle = 'white';
                    //context.fillText(JSON.stringify(pointer), pointer.x + 30, pointer.y - 30);
                    context.beginPath();
                    context.strokeStyle = pointer.color;
                    context.lineWidth = 6;
                    context.arc(pointer.start.x, pointer.start.y, 40, 0, Math.PI * 2, true);
                    context.stroke();
                    context.beginPath();
                    context.strokeStyle = pointer.color;
                    context.lineWidth = 2;
                    context.arc(pointer.start.x, pointer.start.y, 60, 0, Math.PI * 2, true);
                    context.stroke();
                    context.beginPath();
                    context.strokeStyle = pointer.color;
                    context.arc(pointer.x, pointer.y, 40, 0, Math.PI * 2, true);
                    context.stroke();
                } else {
                    // just draw touches
                    //context.beginPath();
                    //context.fillStyle = 'white';
                    //context.fillText(JSON.stringify(pointer), pointer.x + 30, pointer.y - 30);

                    context.beginPath();
                    context.strokeStyle = pointer.color;
                    context.lineWidth = '6';
                    context.arc(pointer.x, pointer.y, 40, 0, Math.PI * 2, true);
                    context.stroke();
                }
            });

            window.requestAnimationFrame(gamepad.draw.bind(gamepad));
        };

        return VirtualGamepad;
    });
