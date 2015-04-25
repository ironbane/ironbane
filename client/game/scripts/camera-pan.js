angular
    .module('game.scripts.camera-pan', [
        'engine.scriptBank'
    ])
    .run([
        'ScriptBank',
        function(ScriptBank) {
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

                //var magic = 35;
                var magic = 2;

                cameraComponent._camera.position.set(Math.sin(elapsed * multiplier / 20) * -18, (magic + 2) + Math.cos(elapsed * multiplier / 20) * magic, Math.cos(elapsed * multiplier / 20) * 18);
                cameraComponent._camera.rotation.set(0, -elapsed * multiplier / 20, 0);
            };

            ScriptBank.add('/scripts/built-in/camera-pan.js', PanScript);
        }
    ]);
