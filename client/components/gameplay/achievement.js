angular
    .module('components.gameplay.achievement', [
        'ces',
        'three',
        'engine.entity-cache'
    ])
    .config(['$componentsProvider', function($componentsProvider) {
        'use strict';

        $componentsProvider.addComponentData({
            'achievement': {
                id: '',
                type: 'area',
                radius: 5,
                message: 'You got an achievement!'
            }
        });
    }])
    .factory('AchievementSystem', [
        'System',
        'THREE',
        '$entityCache',
        '$log',
        function(System, THREE, $entityCache, $log) {
            'use strict';

            var AchievementSystem = System.extend({
                addedToWorld: function(world) {
                    var sys = this;

                    sys._super(world);

                    this.achieved = {};
                },
                achieve: function(achievementData) {
                    //$log.debug('AchievementSystem: achieve', achievementData);

                    // TODO: active charId because char switching doesn't reset systems
                    if (!this.achieved[achievementData.name]) {
                        this.achieved[achievementData.name] = true;

                        Meteor.call('achieve', achievementData);
                    }
                },
                update: function() {
                    var world = this.world;

                    var mainPlayer = $entityCache.get('mainPlayer');

                    var self = this;

                    var achievementEntities = world.getEntities('achievement');

                    achievementEntities.forEach(function(entity) {
                        if (mainPlayer) {
                            var achievementData = entity.getComponent('achievement');
                            if (achievementData.type === 'area') {
                                if (mainPlayer.position.clone().sub(entity.position).lengthSq() < achievementData.radius * achievementData.radius) {
                                    //$log.debug('AchievementSystem: update', entity, achievementData);

                                    self.achieve({
                                        name: entity.name,
                                        level: entity.doc ? entity.doc.level : 'unknown'
                                    });
                                }
                            }
                        }
                    });
                }
            });

            return AchievementSystem;
        }
    ]);
