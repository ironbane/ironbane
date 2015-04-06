angular.module('components.gameplay.achievement', ['ces', 'three', 'engine.entity-cache'])
    .config(['$componentsProvider', function($componentsProvider) {
        'use strict';

        $componentsProvider.addComponentData({
            'achievement': {
                type: 'area',
                radius: 5
            }
        });
    }])
    .factory('AchievementSystem', ['System', 'THREE', '$entityCache', function(System, THREE, $entityCache) {
        'use strict';

        var AchievementSystem = System.extend({
            addedToWorld: function(world) {
                var sys = this;

                sys._super(world);

                world.entityAdded('achievement').add(function(entity) {
                    var achievementData = entity.getComponent('achievement'),
                        achievement;

                    achievementData.achievement = achievement;
                });

                this.achieved = {};
            },
            achieve: function(achievementData) {

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
                                self.achieve({
                                    name: entity.name,
                                    level: entity.level
                                });
                            }
                        }
                    }
                });
            }
        });

        return AchievementSystem;
    }]);
