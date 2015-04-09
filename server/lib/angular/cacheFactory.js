// this is pretty much ripped straight from angular and tweaked for the server :)
angular
    .module('ng')
    .provider('$cacheFactory', function $CacheFactoryProvider() {
        'use strict';
        this.$get = function() {
            var caches = {};

            function cacheFactory(cacheId, options) {
                if (cacheId in caches) {
                    throw new Error('$cacheFactory CacheId ' + cacheId + ' is already taken!');
                }

                var size = 0,
                    stats = angular.extend({}, options, {
                        id: cacheId
                    }),
                    data = {},
                    capacity = (options && options.capacity) || Number.MAX_VALUE,
                    lruHash = {},
                    freshEnd = null,
                    staleEnd = null;

                /**
                 * @ngdoc type
                 * @name $cacheFactory.Cache
                 *
                 * @description
                 * A cache object used to store and retrieve data, primarily used by
                 * {@link $http $http} and the {@link ng.directive:script script} directive to cache
                 * templates and other data.
                 *
                 * ```js
                 *  angular.module('superCache')
                 *    .factory('superCache', ['$cacheFactory', function($cacheFactory) {
                 *      return $cacheFactory('super-cache');
                 *    }]);
                 * ```
                 *
                 * Example test:
                 *
                 * ```js
                 *  it('should behave like a cache', inject(function(superCache) {
                 *    superCache.put('key', 'value');
                 *    superCache.put('another key', 'another value');
                 *
                 *    expect(superCache.info()).toEqual({
                 *      id: 'super-cache',
                 *      size: 2
                 *    });
                 *
                 *    superCache.remove('another key');
                 *    expect(superCache.get('another key')).toBeUndefined();
                 *
                 *    superCache.removeAll();
                 *    expect(superCache.info()).toEqual({
                 *      id: 'super-cache',
                 *      size: 0
                 *    });
                 *  }));
                 * ```
                 */
                return caches[cacheId] = {

                    /**
                     * @ngdoc method
                     * @name $cacheFactory.Cache#put
                     * @kind function
                     *
                     * @description
                     * Inserts a named entry into the {@link $cacheFactory.Cache Cache} object to be
                     * retrieved later, and incrementing the size of the cache if the key was not already
                     * present in the cache. If behaving like an LRU cache, it will also remove stale
                     * entries from the set.
                     *
                     * It will not insert undefined values into the cache.
                     *
                     * @param {string} key the key under which the cached data is stored.
                     * @param {*} value the value to store alongside the key. If it is undefined, the key
                     *    will not be stored.
                     * @returns {*} the value stored.
                     */
                    put: function(key, value) {
                        if (angular.isUndefined(value)) return;
                        if (capacity < Number.MAX_VALUE) {
                            var lruEntry = lruHash[key] || (lruHash[key] = {
                                key: key
                            });

                            refresh(lruEntry);
                        }

                        if (!(key in data)) size++;
                        data[key] = value;

                        if (size > capacity) {
                            this.remove(staleEnd.key);
                        }

                        return value;
                    },

                    /**
                     * @ngdoc method
                     * @name $cacheFactory.Cache#get
                     * @kind function
                     *
                     * @description
                     * Retrieves named data stored in the {@link $cacheFactory.Cache Cache} object.
                     *
                     * @param {string} key the key of the data to be retrieved
                     * @returns {*} the value stored.
                     */
                    get: function(key) {
                        if (capacity < Number.MAX_VALUE) {
                            var lruEntry = lruHash[key];

                            if (!lruEntry) return;

                            refresh(lruEntry);
                        }

                        return data[key];
                    },


                    /**
                     * @ngdoc method
                     * @name $cacheFactory.Cache#remove
                     * @kind function
                     *
                     * @description
                     * Removes an entry from the {@link $cacheFactory.Cache Cache} object.
                     *
                     * @param {string} key the key of the entry to be removed
                     */
                    remove: function(key) {
                        if (capacity < Number.MAX_VALUE) {
                            var lruEntry = lruHash[key];

                            if (!lruEntry) return;

                            if (lruEntry == freshEnd) freshEnd = lruEntry.p;
                            if (lruEntry == staleEnd) staleEnd = lruEntry.n;
                            link(lruEntry.n, lruEntry.p);

                            delete lruHash[key];
                        }

                        delete data[key];
                        size--;
                    },


                    /**
                     * @ngdoc method
                     * @name $cacheFactory.Cache#removeAll
                     * @kind function
                     *
                     * @description
                     * Clears the cache object of any entries.
                     */
                    removeAll: function() {
                        data = {};
                        size = 0;
                        lruHash = {};
                        freshEnd = staleEnd = null;
                    },


                    /**
                     * @ngdoc method
                     * @name $cacheFactory.Cache#destroy
                     * @kind function
                     *
                     * @description
                     * Destroys the {@link $cacheFactory.Cache Cache} object entirely,
                     * removing it from the {@link $cacheFactory $cacheFactory} set.
                     */
                    destroy: function() {
                        data = null;
                        stats = null;
                        lruHash = null;
                        delete caches[cacheId];
                    },


                    /**
                     * @ngdoc method
                     * @name $cacheFactory.Cache#info
                     * @kind function
                     *
                     * @description
                     * Retrieve information regarding a particular {@link $cacheFactory.Cache Cache}.
                     *
                     * @returns {object} an object with the following properties:
                     *   <ul>
                     *     <li>**id**: the id of the cache instance</li>
                     *     <li>**size**: the number of entries kept in the cache instance</li>
                     *     <li>**...**: any additional properties from the options object when creating the
                     *       cache.</li>
                     *   </ul>
                     */
                    info: function() {
                        return angular.extend({}, stats, {
                            size: size
                        });
                    }
                };


                /**
                 * makes the `entry` the freshEnd of the LRU linked list
                 */
                function refresh(entry) {
                    if (entry != freshEnd) {
                        if (!staleEnd) {
                            staleEnd = entry;
                        } else if (staleEnd == entry) {
                            staleEnd = entry.n;
                        }

                        link(entry.n, entry.p);
                        link(entry, freshEnd);
                        freshEnd = entry;
                        freshEnd.n = null;
                    }
                }


                /**
                 * bidirectionally links two entries of the LRU linked list
                 */
                function link(nextEntry, prevEntry) {
                    if (nextEntry != prevEntry) {
                        if (nextEntry) nextEntry.p = prevEntry; //p stands for previous, 'prev' didn't minify
                        if (prevEntry) prevEntry.n = nextEntry; //n stands for next, 'next' didn't minify
                    }
                }
            }


            /**
             * @ngdoc method
             * @name $cacheFactory#info
             *
             * @description
             * Get information about all the caches that have been created
             *
             * @returns {Object} - key-value map of `cacheId` to the result of calling `cache#info`
             */
            cacheFactory.info = function() {
                var info = {};
                angular.forEach(caches, function(cache, cacheId) {
                    info[cacheId] = cache.info();
                });
                return info;
            };


            /**
             * @ngdoc method
             * @name $cacheFactory#get
             *
             * @description
             * Get access to a cache object by the `cacheId` used when it was created.
             *
             * @param {string} cacheId Name or id of a cache to access.
             * @returns {object} Cache object identified by the cacheId or undefined if no such cache.
             */
            cacheFactory.get = function(cacheId) {
                return caches[cacheId];
            };


            return cacheFactory;
        };
    });
