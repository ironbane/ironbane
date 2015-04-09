angular
    .module('game.scripts.camera-pan', [
        'engine.scriptBank',
        'three'
    ])
    .run([
        'ScriptBank',
        'THREE',
        function(ScriptBank, THREE) {
            'use strict';

            var PanScript = function(entity) {
                this.entity = entity;
            };

            PanScript.prototype.update = function(dt, elapsed, timestamp) {
                // this script should be attached to an entity with a camera component....
                var cameraComponent = this.entity.getComponent('camera');

                if (!cameraComponent) {
                    // throw error?
                    return;
                }

                var multiplier = 1.0;

                cameraComponent.camera.position.set(Math.sin(timestamp * multiplier / 20) * -18, 37 + Math.cos(timestamp * multiplier / 20) * 35, Math.cos(timestamp * multiplier / 20) * 18);
                cameraComponent.camera.rotation.set(0, -timestamp * multiplier / 20, 0);
            };

            ScriptBank.add('/scripts/built-in/camera-pan.js', PanScript);
        }
    ]);
