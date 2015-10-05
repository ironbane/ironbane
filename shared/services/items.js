angular
    .module('services.items', [
        'models.items',
        'game.itemBehaviors'
    ])
    .service('ItemService', [
        'ItemsCollection',
        '$cacheFactory',
        '$injector',
        function(ItemsCollection, $cacheFactory, $injector) {
            'use strict';

            let _cache = $cacheFactory('ItemBehaviorCache');

            this.getItemTemplate = function getItemTemplate(itemName) {
                return ItemsCollection.findOne({
                    name: itemName
                }) || null;
            };

            this.executeBehaviorScript = function executeBehaviorScript(scriptName, item, entity) {
                let template = this.getItemTemplate(item.name);

                if (!template) {
                    // if we don't have a valid template, prolly shouldn't allow equipping this...
                    return;
                }

                if (angular.isUndefined(template.behavior) || template.behavior.length === 0) {
                    // no behavior to test, allow it
                    return true;
                }

                var result = [];

                template.behavior.forEach(function(behavior) {
                    let data = behavior.split(' ');
                    let behaviorName = data.shift();
                    let args = data.join(' ');

                    if (behaviorName) {
                        let cachedFn = _cache.get(behavior);
                        if (cachedFn) {
                            result.push(cachedFn[scriptName](item, entity));
                        } else {
                            try {
                                let BehaviorFn = $injector.get(behaviorName + 'ItemBehavior');
                                let fn = new BehaviorFn(args);
                                _cache.put(behavior, fn);
                                result.push(fn[scriptName](item, entity));
                            } catch (err) {
                                console.log('Error loading ItemBehavior: ', behaviorName, err.message);
                            }
                        }
                    }
                });

                if (result.length === 0) {
                    // there were no valid behaviors to test, pass
                    return true;
                }

                // ALL of them must pass
                return result.every(res => res);
            };

            this.onBeforeEquipItem = function onBeforeEquipItem(item, entity) {
                return this.executeBehaviorScript('onBeforeEquip', item, entity);
            };

            this.onEquipItem = function onEquipItem(item, entity) {
                return this.executeBehaviorScript('onEquip', item, entity);
            };

            this.onUnEquipItem = function onUnEquipItem(item, entity) {
                return this.executeBehaviorScript('onUnEquip', item, entity);
            };

            this.onBeforeUseItem = function onEquipItem(item, entity) {
                return this.executeBehaviorScript('onBeforeUse', item, entity);
            };

            this.onUseItem = function onUnEquipItem(item, entity) {
                return this.executeBehaviorScript('onUse', item, entity);
            };

            this.onBeforePickupItem = function onEquipItem(item, entity) {
                return this.executeBehaviorScript('onBeforePickup', item, entity);
            };

            this.onPickupItem = function onUnEquipItem(item, entity) {
                return this.executeBehaviorScript('onPickup', item, entity);
            };

            this.onBeforeDropItem = function onEquipItem(item, entity) {
                return this.executeBehaviorScript('onBeforeDrop', item, entity);
            };

            this.onDropItem = function onUnEquipItem(item, entity) {
                return this.executeBehaviorScript('onDrop', item, entity);
            };

            this.onBeforeAttackItem = function onEquipItem(item, entity) {
                return this.executeBehaviorScript('onBeforeAttack', item, entity);
            };

            this.onAttackItem = function onUnEquipItem(item, entity) {
                return this.executeBehaviorScript('onAttack', item, entity);
            };

            this.onBeforeHitItem = function onEquipItem(item, entity) {
                return this.executeBehaviorScript('onBeforeHit', item, entity);
            };

            this.onHitItem = function onUnEquipItem(item, entity) {
                return this.executeBehaviorScript('onHit', item, entity);
            };
        }
    ]);
