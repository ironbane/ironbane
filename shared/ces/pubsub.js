angular.module('ces.pubsub', [])
    .factory('CESPubSub', [
        '$log',
        function($log) {
            'use strict';

            // taken and tweaked from here: https://github.com/tjlav5/angular-pubsub

            var idCounter = 0;
            var uniqueId = function(prefix) {
                var id = ++idCounter + '';
                return prefix ? prefix + id : id;
            };

            var PubSub = function(config) {
                config = config || {};
                this.evCache = {};
                this.cbCache = {};

                this.debug = config.debug || false;
            };

            PubSub.prototype.publish = function(eventName) {
                var args = Array.prototype.slice.call(arguments, 1);

                if (this.debug) {
                    $log.debug('PUBLISH', eventName, args, ' :: ', arguments);
                }

                this.evCache[eventName] = this.evCache[eventName] || {
                    uids: []
                };

                angular.forEach(this.evCache[eventName].uids, function(uid) {
                    this.cbCache[uid].fn.apply(null, args);
                }.bind(this));
            };

            PubSub.prototype.subscribe = function(eventName, callback) {
                if (this.debug) {
                    $log.debug('SUBSCRIBE', eventName, callback);
                }

                if (!(eventName && callback)) {
                    throw new Error();
                }

                var uid = uniqueId(eventName);

                this.evCache[eventName] = this.evCache[eventName] || {
                    cache: undefined,
                    uids: []
                };
                this.evCache[eventName].uids.push(uid);
                this.cbCache[uid] = {
                    fn: callback,
                    eventName: eventName
                };

                return uid;

            };

            PubSub.prototype.unsubscribe = function(uid) {
                if (this.debug) {
                    $log.debug('UNSUBSCRIBE', uid);
                }

                if (!uid) {
                    throw new Error();
                }

                var eventName = this.cbCache[uid] && this.cbCache[uid].eventName;

                this.evCache[eventName].uids = this.evCache[eventName].uids.filter(function(_uid) {
                    return _uid !== uid;
                });
                delete this.cbCache[uid];

            };

            return PubSub;
        }
    ]);
