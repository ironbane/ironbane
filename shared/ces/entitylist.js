angular
    .module('ces.entitylist', [
        'ces.linkedList'
    ])
    .factory('EntityList', [
        'LinkedList',
        function(LinkedList) {

            'use strict';

            function EntityList() {
                LinkedList.call(this);

                // id hash for O(1) access
                this._entities = {};
            }

            EntityList.prototype = Object.create(LinkedList.prototype);
            EntityList.prototype.constructor = EntityList;

            EntityList.prototype.add = function(entity) {
                var node = LinkedList.prototype.add.call(this, entity);
                this._entities[entity.id] = node;

                return node;
            };

            EntityList.prototype.has = function(entity) {
                if (!entity) {
                    // TODO: find out what is passing undefined into here
                    return false;
                }
                return this._entities[entity.id] !== undefined;
            };

            EntityList.prototype.remove = function(entity) {
                var node = this._entities[entity.id];
                if (node) {
                    this.removeNode(node);
                }
            };

            EntityList.prototype.removeNode = function(node) {
                LinkedList.prototype.removeNode.call(this, node);
                delete this._entities[node.data.id];
            };

            EntityList.prototype.clear = function() {
                LinkedList.prototype.clear.call(this);
                this._entities = {};
            };

            return EntityList;
        }
    ]);
