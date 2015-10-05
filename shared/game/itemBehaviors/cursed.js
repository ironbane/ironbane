/*jshint unused:false*/
angular
    .module('game.itemBehaviors.cursed', [
        'game.itemBehaviors.baseItemBehavior'
    ])
    .factory('CursedItemBehavior', [
        'BaseItemBehavior',
        function(BaseItemBehavior) {
            'use strict';

            class CursedItemBehavior extends BaseItemBehavior {

                constructor() {
                    super();
                }

                onUnEquip(item, entity) {
                    // TODO: msg user "You can't seem to put this down!"
                    return false;
                }
            }

            return CursedItemBehavior;
        }
    ]);
