angular
    .module('game.systems.script', [
        'ces',
        'engine.scriptBank'
    ])
    .factory('ScriptSystem', [
        'System',
        'ScriptBank',
        '$log',
        function(System, ScriptBank, $log) {
            'use strict';

            var ScriptSystem = System.extend({
                addedToWorld: function(world) {
                    var sys = this;

                    sys._super(world);

                    world.entityAdded('script').add(function(entity) {
                        var scriptData = entity.getComponent('script');

                        // instances are created and stored in _scripts
                        scriptData._scripts = [];

                        angular.forEach(scriptData.scripts, function(scr) {
                            var scriptPath,
                                scriptParams = {};

                            if (angular.isString(scr)) {
                                scriptPath = scr;
                            } else {
                                scriptPath = scr.src;
                                scriptParams = scr.params;
                            }

                            ScriptBank.get(scriptPath)
                                .then(function(Script) {
                                    scriptData._scripts.push(new Script(entity, world, scriptParams));
                                }, function(err) {
                                    $log.error('Error fetching script! ', scriptPath, err);
                                });

                        });
                    });

                    world.entityRemoved('script').add(function(entity) {
                        var scripts = entity.getComponent('script')._scripts;

                        angular.forEach(scripts, function(script) {
                            // destroy lifecycle for each script
                            if (angular.isFunction(script.destroy)) {
                                script.destroy.call(script);
                            }
                        });
                    });
                },
                update: function(dt, elapsed, timestamp) {
                    var world = this.world;

                    world.getEntities('script').forEach(function(scripted) {
                        var scripts = scripted.getComponent('script')._scripts;

                        angular.forEach(scripts, function(script) {
                            // update lifecycle for each script
                            if (angular.isFunction(script.update)) {
                                script.update.call(script, dt, elapsed, timestamp);
                            }
                        });
                    });
                }
            });

            return ScriptSystem;
        }
    ]);
