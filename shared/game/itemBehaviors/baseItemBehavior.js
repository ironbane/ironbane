angular
.module('game.itemBehaviors.baseItemBehavior', [])
.factory('BaseItemBehavior', [
    function() {
        'use strict';

        class BaseItemBehavior {
            onBeforeEquip(item, entity) {
                return true;
            }

            onEquip(item, entity) {
                return true;
            }

            onBeforeUnEquip(item, entity) {
                return true;
            }

            onUnEquip(item, entity) {
                return true;
            }
        }

        return BaseItemBehavior;
    }
]);
