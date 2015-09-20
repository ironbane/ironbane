angular
    .module('ces.objectPool', [
        'ces.linkedList'
    ])
    .factory('ObjectPool', [
        'LinkedList',
        function(LinkedList) {
            'use strict';

            function ObjectPool(ObjectType) {
                if (!ObjectType || !ObjectType.prototype.reset) {
                    throw new Error('Object to be pooled is required and must implement a reset method.');
                }

                this._objectType = ObjectType;

                this.actives = new LinkedList();
                this.reserve = new LinkedList();

                this.id = '__' + ObjectType.name + 'Pool__';
            }

            ObjectPool.prototype.initPool = function(size) {
                for (var i = 0; i < size; i++) {
                    var obj = new this._objectType();
                    var node = this.reserve.add(obj);
                    obj[this.id] = node;
                }
            };

            ObjectPool.prototype.get = function() {
                var obj, node;

                if (this.reserve.isEmpty()) {
                    obj = new this._objectType();
                    node = this.actives.add(obj);
                    obj[this.id] = node;
                } else {
                    node = this.reserve.head;
                    obj = node.data;
                    this.reserve.removeNode(node);
                    node = this.actives.add(obj);
                    obj[this.id] = node;
                }

                return obj;
            };

            ObjectPool.prototype.free = function(obj) {
                this.actives.removeNode(obj[this.id]);
                this.reserve.addNode(obj[this.id]);

                // reset to factory state (should cleanup any references that can go)
                obj.reset();
            };

            return ObjectPool;
        }
    ]);
