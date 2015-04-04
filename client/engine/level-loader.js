angular
    .module('engine.level-loader', [
        'engine.entity-builder',
        'game.world-root'
    ])
    .service('LevelLoader', [
        '$rootWorld',
        '$http',
        'EntityBuilder',
        '$log',
        '$q',
        function($rootWorld, $http, EntityBuilder, $log, $q) {
            'use strict';

            var me = this;

            this.activeLevel = null;

            this.load = function(sceneId) {

                if (me.activeLevel) {
                    $rootWorld.removeEntity(me.activeLevel.level);
                }

                var level = EntityBuilder.build('WorldMesh', {
                    components: {
                        scene: {
                            id: sceneId
                        },
                        rigidBody: {
                            shape: {
                                type: 'concave'
                            },
                            mass: 0
                        }
                    }
                });

                me.activeLevel = {
                    level: level,
                    sceneId: sceneId
                };

                $rootWorld.addEntity(level);

                return $q.all([level.getComponent('scene').meshTask]);
            };

        }
    ]);
