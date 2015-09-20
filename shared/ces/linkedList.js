angular
    .module('ces.linkedList', [])
    .factory('LinkedList', [
        function() {
            'use strict';

            function LinkedListNode(data) {
                this.prev = null;
                this.next = null;
                this.data = data;
            }

            function LinkedList() {
                this.head = this.tail = null;
                this.size = 0;
            }

            // static access to node type
            LinkedList.LinkedListNode = LinkedListNode;

            LinkedList.prototype.add = function(obj) {
                var node = new LinkedListNode(obj);

                this.addNode(node);

                return node;
            };

            LinkedList.prototype.addNode = function(node) {
                if (this.head === null) {
                    this.head = this.tail = node;
                } else {
                    node.prev = this.tail;
                    this.tail.next = node;
                    this.tail = node;
                }

                this.size++;
            };

            LinkedList.prototype.contains = function(obj) {
                var node = this.head;

                while(node) {
                    if (node.data === obj) {
                        return true;
                    }
                }

                return false;
            };

            LinkedList.prototype.remove = function(obj) {
                var node = this.head;

                while (node) {
                    if (node.data === obj) {
                        this.removeNode(node);
                        break;
                    }

                    node = node.next;
                }
            };

            LinkedList.prototype.removeNode = function(node) {
                if (node.prev === null) {
                    this.head = node.next;
                } else {
                    node.prev.next = node.next;
                }

                if (node.next === null) {
                    this.tail = node.prev;
                } else {
                    node.next.prev = node.prev;
                }

                this.size--;
            };

            LinkedList.prototype.clear = function() {
                this.head = this.tail = null;
                this.size = 0;
            };

            LinkedList.prototype.isEmpty = function() {
                return this.size === 0;
            };

            LinkedList.prototype.toArray = function() {
                var array, node;

                array = [];
                for (node = this.head; node; node = node.next) {
                    array.push(node.data);
                }

                return array;
            };

            LinkedList.prototype.forEach = function(callback, reversed) {
                var currentNode = reversed ? this.tail : this.head;
                while (currentNode !== null) {
                    if (callback(currentNode.data) === false) {
                        break;
                    }
                    currentNode = reversed ? currentNode.prev : currentNode.next;
                }
            };

            return LinkedList;
        }
    ]);
