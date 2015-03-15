angular
    .module('engine.level-loader', [
        'engine.entity-builder',
        'game.world-root'
    ])
    .service('LevelLoader', function ($rootWorld, $http, EntityBuilder, $log, $q) {

        this.load = function (levelId) {
            // TODO: clear world out first?
            var entitiesTask;

            var level = EntityBuilder.build('WorldMesh', {
                components: {
                    scene: {
                        id: levelId
                    },
                    rigidBody: {
                        shape: {
                            type: 'concave'
                        },
                        mass: 0
                    }
                }
            });
            $rootWorld.addEntity(level);

            entitiesTask = $http.get('assets/scene/' + levelId + '/ib-entities.json')
                .then(function (response) {
                    var entities = EntityBuilder.load(response.data);

                    $log.log('level loader ents: ', entities);

                    $rootWorld.addEntity(entities);
                });

            return $q.all([level.getComponent('scene').meshTask, entitiesTask]);
        };

    });
