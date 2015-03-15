angular.module('engine.socket', [])
    .factory('Socket', [
        '$q',
        '$log',
        '$window',
        '$rootScope',
        function ($q, $log, $window, $rootScope) {

            var Socket = function (url) {
                this.url = url;

                this._socket = null;

                this._deferred = $q.defer();
                this._promise = this._deferred.promise;
            };

            Socket.prototype.connect = function (url, namespace) {
                var socket = this;

                if (url) {
                    $log.debug('socket override url: ', url);
                    // allow override during connect
                    socket.url = url;
                }

                if (namespace) {
                    socket.url += '/' + namespace;
                    $log.debug('socket namespace url: ', socket.url);
                }

                if (socket._socket !== null) {
                    $log.warn('socket already exists', socket._socket);
                    return;
                }

                socket._socket = $window.io(socket.url, {
                    reconnect: false
                });

                socket._socket.on('error', function (err) {
                    $log.error('socket connect error: ', err);
                    socket._deferred.reject(err);
                });

                socket._socket.on('connect', function () {
                    $log.log('socket connected!', socket._socket);
                    socket._deferred.resolve(socket._socket);
                });

            };

            Socket.prototype.on = function (eventName, callback) {
                var me = this;

                // deferred events until we are connected
                me._promise.then(function (socket) {
                    socket.on(eventName, function () {
                        var args = arguments;
                        callback.apply(socket, args);
                        _.throttle(function () {
                            $rootScope.$apply();
                        }, 500)(); // update angular slower than socket
                    });
                });
            };

            Socket.prototype.emit = function (eventName, data, callback) {
                var socket = this;

                // emit doesn't need to be deferred, but also can't be called until connected
                if (socket._socket === null) {
                    //$log.warn('emit called before connected', arguments);
                    return;
                }

                socket._socket.emit(eventName, data, function () {
                    var args = arguments;
                    $rootScope.$apply(function () {
                        if (callback) {
                            callback.apply(socket._socket, args);
                        }
                    });
                });
            };

            return Socket;
        }
    ]);
