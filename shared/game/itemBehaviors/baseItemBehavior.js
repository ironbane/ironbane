/*jshint unused:false*/
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

            onBeforeUse(item, entity) {
                return true;
            }

            onUse(item, entity) {
                return true;
            }

            onBeforePickup(item, entity) {
                return true;
            }

            onPickup(item, entity) {
                return true;
            }

            onBeforeDrop(item, entity) {
                return true;
            }

            onDrop(item, entity) {
                return true;
            }

            onBeforeAttack(item, entity) {
                return true;
            }

            onAttack(item, entity) {
                return true;
            }

            onBeforeHit(item, entity) {
                return true;
            }

            onHit(item, entity) {
                return true;
            }
        }

        return BaseItemBehavior;
    }
]);
